package main

import (
	"testing"

	"github.com/google/go-cmp/cmp"
)

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

func TestParsePortRange(t *testing.T) {
	testFuncs := []struct {
		given    string
		expected intSlice
	}{
		{
			given:    "",
			expected: intSlice{80, 443, 8001, 9001},
		},
		{
			given:    "80,443,9090",
			expected: intSlice{80, 443, 9090},
		},
		{
			given:    "80-90",
			expected: intSlice{80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90},
		},
		{
			given:    "22-24,80,8080-8083",
			expected: intSlice{22, 23, 24, 80, 8080, 8081, 8082, 8083},
		},
		{
			given:    "80",
			expected: intSlice{80},
		},
	}

	for _, testFunc := range testFuncs {
		i := intSlice{}
		if err := i.Set(testFunc.given); err != nil {
			t.Fatal(err)
		}
		if !cmp.Equal(testFunc.expected, i) {
			t.Fatalf("expected: %#v\ngot: %#v", testFunc.expected, i)
		}
	}
}
