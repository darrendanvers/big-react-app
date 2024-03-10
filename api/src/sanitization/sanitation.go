package sanitization

import "github.com/microcosm-cc/bluemonday"

var (
	policy = bluemonday.UGCPolicy()
)

// Policy returns the global input sanitization policy.
func Policy() *bluemonday.Policy {
	return policy
}
