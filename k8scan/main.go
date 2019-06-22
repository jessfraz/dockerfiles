package main

import (
	"context"
	"crypto/tls"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"os/signal"
	"path/filepath"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/Sirupsen/logrus"
	mailgun "github.com/mailgun/mailgun-go"
)

const (
	defaultCIDR = "0.0.0.0/0"

	arinAPIEndpoint = "http://whois.arin.net/rest/ip/%s"

	emailSender = "k8scan@jessfraz.com"
)

var (
	timeoutPing time.Duration
	timeoutGet  time.Duration

	cidr string

	defaultPorts  = intSlice{80, 443, 8001, 9001}
	originalPorts string
	ports         intSlice

	useMasscan bool

	mailgunDomain  string
	mailgunAPIKey  string
	emailRecipient string

	debug bool
)

// intSlice is a slice of ints
type intSlice []int

// implement the flag interface for intSlice
func (i *intSlice) String() (out string) {
	for k, v := range *i {
		if k < len(*i)-1 {
			out += fmt.Sprintf("%d,", v)
		} else {
			out += fmt.Sprintf("%d", v)
		}
	}
	return out
}

func (i *intSlice) Set(value string) error {
	originalPorts = value

	// Set the default if nothing was given.
	if len(value) <= 0 {
		*i = defaultPorts
		return nil
	}

	// Split on "," for individual ports and ranges.
	r := strings.Split(value, ",")
	for _, pr := range r {
		// Split on "-" to denote a range.
		if strings.Contains(pr, "-") {
			p := strings.SplitN(pr, "-", 2)
			begin, err := strconv.Atoi(p[0])
			if err != nil {
				return err
			}
			end, err := strconv.Atoi(p[1])
			if err != nil {
				return err
			}
			if begin > end {
				return fmt.Errorf("end port can not be greater than the beginning port: %d > %d", end, begin)
			}
			for port := begin; port <= end; port++ {
				*i = append(*i, port)
			}

			continue
		}

		// It is not a range just parse the port
		port, err := strconv.Atoi(pr)
		if err != nil {
			return err
		}
		*i = append(*i, port)
	}

	return nil
}

func init() {
	flag.DurationVar(&timeoutPing, "timeout-ping", 2*time.Second, "Timeout for checking that the port is open")
	flag.DurationVar(&timeoutGet, "timeout-get", 10*time.Second, "Timeout for getting the contents of the URL")

	flag.StringVar(&cidr, "cidr", defaultCIDR, "IP CIDR to scan")
	flag.Var(&ports, "ports", fmt.Sprintf("Ports to scan (ex. 80-443 or 80,443,8080 or 1-20,22,80-443) (default %q)", defaultPorts.String()))

	flag.BoolVar(&useMasscan, "masscan", true, "Use masscan binary for scanning (this is faster than using pure golang)")

	flag.StringVar(&mailgunAPIKey, "mailgun-api-key", "", "Mailgun API Key to use for sending email (optional)")
	flag.StringVar(&mailgunDomain, "mailgun-domain", "", "Mailgun Domain to use for sending email (optional)")
	flag.StringVar(&emailRecipient, "email-recipient", "", "Recipient for email notifications (optional)")

	flag.BoolVar(&debug, "d", false, "Run in debug mode")

	flag.Usage = func() {
		flag.PrintDefaults()
	}

	flag.Parse()

	// Set the log level.
	if debug {
		logrus.SetLevel(logrus.DebugLevel)
	}

	// Set the default ports.
	if len(ports) <= 0 {
		ports = defaultPorts
	}
}

func main() {
	// On ^C, or SIGTERM handle exit.
	c := make(chan os.Signal, 1)
	signal.Notify(c, os.Interrupt)
	signal.Notify(c, syscall.SIGTERM)
	go func() {
		for sig := range c {
			logrus.Infof("Received %s, exiting.", sig.String())
			os.Exit(0)
		}
	}()

	// Set the logger to nil so we ignore messages from the Dial that don't matter.
	// See: https://github.com/golang/go/issues/19895#issuecomment-292793756
	log.SetFlags(0)
	log.SetOutput(ioutil.Discard)

	logrus.Infof("Scanning for Kubernetes Dashboards and API Servers on %s over port range %s", cidr, originalPorts)
	if len(mailgunDomain) > 0 && len(mailgunAPIKey) > 0 && len(emailRecipient) > 0 {
		logrus.Infof("Using Mailgun Domain %s, API Key %s to send emails to %s", mailgunDomain, mailgunAPIKey, emailRecipient)
	}
	logrus.Infof("This may take a bit...")

	var (
		startTime = time.Now()
		wg        sync.WaitGroup
	)

	if useMasscan {
		m, err := doMasscan()
		if err != nil {
			logrus.Fatal(err)
		}

		logrus.Infof("Found %d open ports", len(m))

		for _, result := range m {
			for _, port := range result.Ports {
				wg.Add(1)
				go func(ip string, port int) {
					defer wg.Done()

					scanIP(ip, port)

				}(result.IP, port.Port)
			}
		}
	} else {
		ip, ipnet, err := net.ParseCIDR(cidr)
		if err != nil {
			logrus.Fatal(err)
		}

		for ip := ip.Mask(ipnet.Mask); ipnet.Contains(ip); inc(ip) {
			for _, port := range ports {
				wg.Add(1)
				go func(ip string, port int) {
					defer wg.Done()

					// Check if the port is open.
					ok := portOpen(ip, port)
					if !ok {
						return
					}

					scanIP(ip, port)

				}(ip.String(), port)
			}
		}
	}

	wg.Wait()

	since := time.Since(startTime)
	logrus.Infof("Scan took: %s", since.String())
}

func scanIP(ip string, port int) {
	// Check if it's a kubernetes dashboard.
	ok, uri := isKubernetesDashboard(ip, port)
	if !ok {
		return
	}

	// Get the info for the ip address.
	info, err := getIPInfo(ip)
	if err != nil {
		logrus.Warnf("ip info err: %v", err)
	}

	fmt.Printf("%s:%d\t%s\t%s\t%s\n",
		ip, port,
		info.Net.Organization.Handle, info.Net.Organization.Name, info.Net.Organization.Reference)

	// send an email
	if len(mailgunDomain) > 0 && len(mailgunAPIKey) > 0 && len(emailRecipient) > 0 {
		if err := sendEmail(uri, ip, port, info); err != nil {
			logrus.Warn(err)
		}
	}
}

func portOpen(ip string, port int) bool {
	c, err := net.DialTimeout("tcp", fmt.Sprintf("%s:%d", ip, port), timeoutPing)
	if err != nil {
		logrus.Debugf("listen at %s:%d failed: %v", ip, port, err)
		return false
	}
	if c != nil {
		c.Close()
	}

	return true
}

func isKubernetesDashboard(ip string, port int) (bool, string) {
	client := &http.Client{
		Timeout: timeoutGet,
		Transport: &http.Transport{
			TLSClientConfig: &tls.Config{
				InsecureSkipVerify: true,
			},
		},
	}

	tryAddrs := []string{
		fmt.Sprintf("http://%s:%d", ip, port),
		fmt.Sprintf("https://%s:%d", ip, port),
		fmt.Sprintf("http://%s:%d/api/", ip, port),
		fmt.Sprintf("https://%s:%d/api/", ip, port),
	}

	var (
		resp *http.Response
		err  = errors.New("not yet run")
		uri  string
	)

	for i := 0; i < len(tryAddrs) && err != nil; i++ {
		uri = tryAddrs[i]
		resp, err = client.Get(uri)
	}
	if err != nil {
		logrus.Debugf("getting %s:%d failed: %v", ip, port, err)
		return false, ""
	}
	defer resp.Body.Close()

	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return false, ""
	}

	body := strings.ToLower(string(b))
	if (strings.Contains(body, "kubernetes") && strings.Contains(body, "dashboard")) ||
		(strings.Contains(body, `"versions"`) && strings.Contains(body, `"serverAddress`)) ||
		(strings.Contains(body, `"paths"`) && strings.Contains(body, `"/api"`)) {
		return true, uri
	}

	return false, ""
}

// ARINResponse describes the data struct that holds the response from ARIN.
type ARINResponse struct {
	Net NetJSON `json:"net,omitempty"`
}

// NetJSON holds the net data from the ARIN response.
type NetJSON struct {
	Organization OrganizationJSON `json:"orgRef,omitempty"`
}

// OrganizationJSON holds the organization data from the ARIN response.
type OrganizationJSON struct {
	Handle    string `json:"@handle,omitempty"`
	Name      string `json:"@name,omitempty"`
	Reference string `json:"$,omitempty"`
}

// MasscanResult holds the masscan results data struct.
// Looks like:
// [
//   {
//     "ip": "104.198.238.41",
//     "timestamp": "1531524211",
//     "ports": [
//       {
//         "port": 22,
//         "proto": "tcp",
//         "status": "open",
//         "reason": "syn-ack",
//         "ttl": 56
//       }
//     ]
//   },
//   ...
// ]
type MasscanResult struct {
	IP        string        `json:"ip,omitempty"`
	Timestamp MasscanTime   `json:"timestamp,omitempty"`
	Ports     []MasscanPort `json:"ports,omitempty"`
}

// MasscanPort defines the data struct for a masscan port.
type MasscanPort struct {
	Port     int    `json:"port,omitempty"`
	Protocol string `json:"proto,omitempty"`
	Status   string `json:"status,omitempty"`
	Reason   string `json:"reason,omitempty"`
	TTL      int    `json:"ttl,omitempty"`
}

// MasscanTime is the time format returned by masscan.
type MasscanTime struct {
	time.Time
}

// UnmarshalJSON sets MasscanTime correctly from a string.
func (t *MasscanTime) UnmarshalJSON(b []byte) error {
	s := strings.Trim(strings.TrimSpace(string(b)), `"`)

	i, err := strconv.ParseInt(s, 10, 64)
	if err != nil {
		return err
	}

	*t = MasscanTime{time.Unix(i, 0)}

	return nil
}

func getIPInfo(ip string) (b ARINResponse, err error) {
	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf(arinAPIEndpoint, ip), nil)
	if err != nil {
		return b, err
	}
	req.Header.Set("Accept", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return b, err
	}
	defer resp.Body.Close()

	if err := json.NewDecoder(resp.Body).Decode(&b); err != nil {
		return b, err
	}

	return b, nil
}

func inc(ip net.IP) {
	for j := len(ip) - 1; j >= 0; j-- {
		ip[j]++
		if ip[j] > 0 {
			break
		}
	}
}

func sendEmail(uri, ip string, port int, arinInfo ARINResponse) error {
	mailgunClient := mailgun.NewMailgun(mailgunDomain, mailgunAPIKey)

	msg, _, err := mailgunClient.Send(context.Background(), mailgunClient.NewMessage(
		/* From */ fmt.Sprintf("%s <%s>", emailSender, emailSender),
		/* Subject */ fmt.Sprintf("[k8scan]: found dashboard %s", uri),
		/* Body */ fmt.Sprintf(`Time: %s

IP: %s:%d
URL: %s

ARIN: %s
	  %s
	  %s
`,
			time.Now().Format(time.UnixDate),
			ip,
			port,
			uri,
			arinInfo.Net.Organization.Handle,
			arinInfo.Net.Organization.Name,
			arinInfo.Net.Organization.Reference,
		),
		/* To */ emailRecipient,
	))
	if err != nil {
		return fmt.Errorf("sending Mailgun message failed: response: %#v error: %v", msg, err)
	}

	return nil
}

func doMasscan() ([]MasscanResult, error) {
	// Create a temporary directory for the output.
	dir, err := ioutil.TempDir(os.TempDir(), "masscan")
	if err != nil {
		return nil, fmt.Errorf("creating temporary directory failed: %v", err)
	}
	defer os.RemoveAll(dir)

	file := filepath.Join(dir, "scan.json")

	cmd := exec.Command("masscan",
		fmt.Sprintf("-p%s", ports.String()),
		cidr,
		"--output-format", "json",
		"--output-file", file,
		"--rate", "1000000",
		"--exclude", "255.255.255.255",
	)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr

	logrus.Infof("Running masscan command: `%s`", strings.Join(cmd.Args, " "))
	if err := cmd.Run(); err != nil {
		return nil, fmt.Errorf("running masscan failed: %v", err)
	}

	b, err := cleanMasscanOutputFile(file)
	if err != nil {
		return nil, fmt.Errorf("cleaning up masscan file failed: %v", err)
	}

	m := []MasscanResult{}

	// Return early if empty.
	if len(b) <= 0 {
		return m, nil
	}

	if err := json.Unmarshal(b, &m); err != nil {
		return nil, fmt.Errorf("unmarshal json failed: %v\nbody: %s", err, string(b))
	}

	logrus.Debugf("masscan result: %#v", m)

	return m, nil
}

func cleanMasscanOutputFile(file string) ([]byte, error) {
	b, err := ioutil.ReadFile(file)
	if err != nil {
		return nil, err
	}

	s := strings.TrimSpace(string(b))
	if len(s) <= 0 {
		return nil, nil
	}

	return []byte(strings.TrimSuffix(s, ",\n]") + "]"), nil
}
