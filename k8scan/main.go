package main

import (
	"crypto/tls"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/Sirupsen/logrus"
)

const (
	cidr = "0.0.0.0/0"

	arinAPIEndpoint = "http://whois.arin.net/rest/ip/%s"
)

var (
	ports = []int{80, 443, 9001, 8001}
)

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

	logrus.Infof("Scanning for Kubernetes Dashboards and API Servers on %s over port range %#v", cidr, ports)
	logrus.Infof("This may take a bit...")

	startTime := time.Now()

	ip, ipnet, err := net.ParseCIDR(cidr)
	if err != nil {
		logrus.Fatal(err)
	}

	var wg sync.WaitGroup
	for ip := ip.Mask(ipnet.Mask); ipnet.Contains(ip); inc(ip) {
		for _, port := range ports {
			wg.Add(1)
			go func(ip string, port int) {
				defer wg.Done()

				scanIP(ip, port)

			}(ip.String(), port)
		}
	}

	wg.Wait()

	since := time.Since(startTime)
	logrus.Infof("Scan took: %s", since.String())
}

func scanIP(ip string, port int) {
	// Check if the port is open.
	ok := portOpen(ip, port)
	if !ok {
		return
	}

	// Check if it's a kubernetes dashboard.
	ok = isKubernetesDashboard(ip, port)
	if !ok {
		return
	}

	fmt.Printf("%s:%d\n", ip, port)
	// Get the info for the ip address.
	info, err := getIPInfo(ip)
	if err != nil {
		logrus.Warnf("ip info err: %v", err)
		return
	}
	fmt.Printf("%s:%d\t%s\t%s\t%s\n",
		ip, port,
		info.Net.Organization.Handle, info.Net.Organization.Name, info.Net.Organization.Reference)
}

func portOpen(ip string, port int) bool {
	c, err := net.DialTimeout("tcp", fmt.Sprintf("%s:%d", ip, port), 2*time.Second)
	if err != nil {
		// logrus.Warnf("listen at %s:%s failed: %v", ip, port, err)
		return false
	}
	defer c.Close()

	return true
}

func isKubernetesDashboard(ip string, port int) bool {
	client := &http.Client{
		Timeout: time.Second * 10,
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
		//logrus.Warnf("getting %s:%s failed: %v", ip, port, err)
		return false
	}
	defer resp.Body.Close()

	b, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return false
	}

	body := strings.ToLower(string(b))
	if (strings.Contains(body, "kubernetes") && strings.Contains(body, "dashboard")) ||
		(strings.Contains(body, `"versions"`) && strings.Contains(body, `"serverAddress`)) ||
		(strings.Contains(body, `"paths"`) && strings.Contains(body, `"/api"`)) {
		logrus.Infof("uri: %s", uri)
		return true
	}

	return false
}

type ARINResponse struct {
	Net NetJSON `json:"net,omitempty"`
}

type NetJSON struct {
	Organization OrganizationJSON `json:"orgRef,omitempty"`
}

type OrganizationJSON struct {
	Handle    string `json:"@handle,omitempty"`
	Name      string `json:"@name,omitempty"`
	Reference string `json:"$,omitempty"`
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
