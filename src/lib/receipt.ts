export interface ReceiptData {
	receiptNumber: string;
	paymentRef: string;
	studentName: string;
	parentName: string;
	routeName: string;
	feeType: string;
	forPeriod: string;
	amount: string;
	paymentMethod: string;
	transactionRef: string | null;
	paidAt: string;
	generatedAt: string;
}

export function buildReceiptData(data: ReceiptData): string {
	return JSON.stringify(data);
}

export function parseReceiptData(raw: string): ReceiptData | null {
	try {
		return JSON.parse(raw) as ReceiptData;
	} catch {
		return null;
	}
}
