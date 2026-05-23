import { customAlphabet } from "nanoid";

const nanoid = customAlphabet(
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
	16,
);

const shortId = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

export function generateId(): string {
	return nanoid();
}

/** Generates a short human-readable reference e.g. PAY-AB12CD34 */
export function generateRef(prefix: string): string {
	return `${prefix}-${shortId()}`;
}
