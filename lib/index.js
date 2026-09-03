/**
 * dsh-whale-clock host half.
 *
 * This row exists so the package is composed into the harness (the
 * client-modules service scans the host Loader's entries for packages
 * declaring `dsh.client` and serves their browser bundles). The widget
 * itself is entirely client-side; the host half is intentionally empty.
 */
export const name = 'dsh-whale-clock'

export function apply() {
  // no host behavior: the client bundle provides the corner widget
}
