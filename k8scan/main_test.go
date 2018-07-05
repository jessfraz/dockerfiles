package main

import "testing"

func TestARINResponse(t *testing.T) {
	info, err := getIPInfo("104.40.92.107")
	if err != nil {
		t.Fatal(err)
	}

	if info.Net.Organization.Handle != "MSFT" {
		t.Fatalf("expected handle to be MSFT, got %s", info.Net.Organization.Handle)
	}
	if info.Net.Organization.Name != "Microsoft Corporation" {
		t.Fatalf("expected handle to be Microsoft Corporation, got %s", info.Net.Organization.Name)
	}
	if info.Net.Organization.Reference != "https://whois.arin.net/rest/org/MSFT" {
		t.Fatalf("expected reference to be https://whois.arin.net/rest/org/MSFT, got %s", info.Net.Organization.Reference)
	}
}
