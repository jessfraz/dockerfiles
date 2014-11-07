package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"time"

	"github.com/Sirupsen/logrus"
	"github.com/coreos/go-etcd/etcd"
)

var (
	iface  string
	logger = logrus.New()
)

type port struct {
	Port  int    `json:"port"`
	Proto string `json:"proto"`
}

// flush the provied chain
func flush(chain string) {
	cmd := exec.Command("iptables", "-F", chain)

	out, err := cmd.CombinedOutput()
	if err != nil {
		logger.WithField("error", err).Errorf("flushing %s: %s", chain, out)
	}
}

func fetchIPs(client *etcd.Client) ([]string, error) {
	resp, err := client.Get("/firewall/ips", false, false)
	if err != nil {
		return nil, err
	}

	var out []string
	if err := json.Unmarshal([]byte(resp.Node.Value), &out); err != nil {
		return nil, err
	}

	return out, nil
}

func fetchPorts(client *etcd.Client) ([]port, error) {
	resp, err := client.Get("/firewall/ports", false, false)
	if err != nil {
		return nil, err
	}

	var out []port
	if err := json.Unmarshal([]byte(resp.Node.Value), &out); err != nil {
		return nil, err
	}

	return out, nil
}

func process(client *etcd.Client) error {
	flush("INPUT")
	logger.Info("flushed existing rules")

	ips, err := fetchIPs(client)
	if err != nil {
		return err
	}

	ports, err := fetchPorts(client)
	if err != nil {
		return err
	}

	for _, p := range ports {
		if err := apply(ips, p.Port, p.Proto); err != nil {
			return err
		}
	}

	logrus.Info("created updated rules")

	return nil
}

// iptables -A INPUT -i eth0 -p tcp --dport 8080 -j DROP
// iptables -I INPUT -i eth0 -s 127.0.0.1 -p tcp --dport 8080 -j ACCEPT
func apply(ips []string, port int, proto string) error {
	// process the DROP rule
	if err := iptables("-A", "INPUT", "-i", iface, "-p", proto, "--dport", fmt.Sprint(port), "-j", "DROP"); err != nil {
		return err
	}

	for _, a := range ips {
		if err := iptables("-I", "INPUT", "-i", iface, "-s", a, "-p", proto, "--dport", fmt.Sprint(port), "-j", "ACCEPT"); err != nil {
			return err
		}
	}

	return nil
}

func iptables(args ...string) error {
	cmd := exec.Command("iptables", args...)

	out, err := cmd.CombinedOutput()
	if err != nil {
		if bytes.Contains(out, []byte("does a matching rule exist in that chain?")) {
			return nil
		}
		logger.WithField("error", err).Errorf("iptables %s", out)

		return err
	}

	return nil
}

func processLoop(client *etcd.Client, update chan *etcd.Response) {
	for resp := range update {
		logger.WithField("key", resp.Node.Key).Info("processing updated rules")

		if err := process(client); err != nil {
			logger.WithField("error", err).Error("add new iptables rules")
		}
	}
}

func main() {
	machine := os.Getenv("ETCD")
	logger.Infof("connecting to %s", machine)

	client := etcd.NewClient([]string{machine})

	resp, err := client.Get("/firewall/interface", false, false)
	if err != nil {
		logger.Fatal(err)
	}

	iface = resp.Node.Value
	if iface == "" {
		logger.Fatal("invalid interface to restrict")
	}

	if err := process(client); err != nil {
		logger.Fatal(err)
	}

	// run in a loop incase we have network issues connecting to etcd
	for i := 0; i < 100; i++ {
		update := make(chan *etcd.Response, 10)
		go processLoop(client, update)

		if _, err := client.Watch("/firewall", 0, true, update, nil); err != nil {
			logger.Error(err)
		}
		close(update)

		time.Sleep(10 * time.Second)

		logger.Infof("restarting process loop %d times", i)
	}
}
