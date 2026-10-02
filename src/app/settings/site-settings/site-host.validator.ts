import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const examples = 'e.g. api.example.com:5000 or 10.0.0.1';

/**
 * Site specific headers are sent when a request's host (`new URL(url).host`: host name and non default port)
 * equals the configured host, so only that form matches.
 * @returns an error message, or null when the host is valid
 */
export function siteHostError(host: string, otherHosts: Iterable<string> = []): string | null {
  const value = host.trim();
  if (value === '') return `Enter a host, ${examples}`;

  const hasScheme = /^[a-z][a-z\d+.-]*:\/\//i.test(value);
  const url = parseUrl(hasScheme ? value : `http://${value}`);
  if (!url || !url.hostname || url.username || url.password || /\s/.test(value)) return `Not a valid host, ${examples}`;
  if (hasScheme) return `Enter the host without scheme: ${url.host}`;
  if (/[/?#]/.test(value)) return `Enter the host without path, query or fragment: ${url.host}`;
  if (url.host !== value.toLowerCase()) return `Requests address this host as ${url.host}`;

  const lowerCaseValue = value.toLowerCase();
  if (Array.from(otherHosts).some(h => h.trim().toLowerCase() === lowerCaseValue)) return 'Settings for this host already exist';
  return null;
}

/** Puts the message of {@link siteHostError} into the `siteHost` error. */
export function siteHostValidator(otherHosts: () => Iterable<string>): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const error = siteHostError(control.value ?? '', otherHosts());
    return error ? { siteHost: error } : null;
  };
}

function parseUrl(url: string): URL | null {
  try {
    return new URL(url);
  } catch {
    return null;
  }
}
