"use client";

import {
	CheckCircle2,
	CreditCard,
	Loader2,
	Smartphone,
	Wallet,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PaymentGatewayProps {
	amount: string;
	description: string;
	onSuccess: (method: string, txRef: string) => void;
	onCancel: () => void;
	isLoading?: boolean;
}

function generateTxRef() {
	return `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;
}

export function PaymentGateway({
	amount,
	description,
	onSuccess,
	onCancel,
	isLoading,
}: PaymentGatewayProps) {
	const [tab, setTab] = useState("upi");
	const [upiId, setUpiId] = useState("");
	const [cardNumber, setCardNumber] = useState("");
	const [cardName, setCardName] = useState("");
	const [cardExpiry, setCardExpiry] = useState("");
	const [cardCvv, setCardCvv] = useState("");
	const [walletPhone, setWalletPhone] = useState("");
	const [processing, setProcessing] = useState(false);
	const [step, setStep] = useState<"form" | "processing" | "success">("form");

	const methodMap: Record<string, string> = {
		upi: "upi",
		credit_card: "credit_card",
		debit_card: "debit_card",
		wallet: "wallet",
	};

	async function handlePay() {
		setProcessing(true);
		setStep("processing");
		// Simulate gateway processing delay
		await new Promise((r) => setTimeout(r, 2000));
		setStep("success");
		await new Promise((r) => setTimeout(r, 1000));
		onSuccess(methodMap[tab] ?? "upi", generateTxRef());
	}

	function formatCard(val: string) {
		return val
			.replace(/\D/g, "")
			.slice(0, 16)
			.replace(/(.{4})/g, "$1 ")
			.trim();
	}
	function formatExpiry(val: string) {
		return val
			.replace(/\D/g, "")
			.slice(0, 4)
			.replace(/^(\d{2})(\d)/, "$1/$2");
	}

	if (step === "processing") {
		return (
			<Card className="mx-auto w-full max-w-md">
				<CardContent className="flex flex-col items-center gap-4 py-12">
					<Loader2 className="h-12 w-12 animate-spin text-amber-500" />
					<p className="font-semibold text-lg">Processing Payment...</p>
					<p className="text-muted-foreground text-sm">
						Please wait, do not close this window
					</p>
				</CardContent>
			</Card>
		);
	}

	if (step === "success") {
		return (
			<Card className="mx-auto w-full max-w-md">
				<CardContent className="flex flex-col items-center gap-4 py-12">
					<CheckCircle2 className="h-12 w-12 text-green-500" />
					<p className="font-semibold text-green-700 text-lg">
						Payment Successful!
					</p>
					<p className="text-muted-foreground text-sm">Redirecting...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="mx-auto w-full max-w-md shadow-lg">
			<CardHeader className="rounded-t-xl bg-[oklch(0.18_0.04_250)] pb-4 text-white">
				<div className="mb-1 flex items-center gap-2">
					<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 font-black text-[oklch(0.18_0.04_250)] text-sm">
						B
					</div>
					<span className="font-bold text-white">BusSaathi Pay</span>
				</div>
				<CardTitle className="text-lg text-white">{description}</CardTitle>
				<div className="mt-2 flex items-baseline gap-1">
					<span className="text-sm text-white/70">Amount Due</span>
					<span className="ml-auto font-black text-2xl text-amber-400">
						₹{amount}
					</span>
				</div>
			</CardHeader>
			<CardContent className="pt-5">
				<Tabs onValueChange={setTab} value={tab}>
					<TabsList className="mb-5 grid h-10 w-full grid-cols-4">
						<TabsTrigger className="gap-1 text-xs" value="upi">
							<Smartphone className="h-3.5 w-3.5" />
							UPI
						</TabsTrigger>
						<TabsTrigger className="gap-1 text-xs" value="credit_card">
							<CreditCard className="h-3.5 w-3.5" />
							Credit
						</TabsTrigger>
						<TabsTrigger className="gap-1 text-xs" value="debit_card">
							<CreditCard className="h-3.5 w-3.5" />
							Debit
						</TabsTrigger>
						<TabsTrigger className="gap-1 text-xs" value="wallet">
							<Wallet className="h-3.5 w-3.5" />
							Wallet
						</TabsTrigger>
					</TabsList>

					{/* UPI */}
					<TabsContent className="space-y-4" value="upi">
						<div className="space-y-1.5">
							<Label>UPI ID</Label>
							<Input
								onChange={(e) => setUpiId(e.target.value)}
								placeholder="yourname@upi"
								value={upiId}
							/>
						</div>
						<p className="text-muted-foreground text-xs">
							Enter your UPI ID (e.g. 9876543210@paytm)
						</p>
					</TabsContent>

					{/* Credit Card */}
					<TabsContent className="space-y-4" value="credit_card">
						<div className="space-y-1.5">
							<Label>Card Number</Label>
							<Input
								maxLength={19}
								onChange={(e) => setCardNumber(formatCard(e.target.value))}
								placeholder="1234 5678 9012 3456"
								value={cardNumber}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Cardholder Name</Label>
							<Input
								onChange={(e) => setCardName(e.target.value)}
								placeholder="Name on card"
								value={cardName}
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Expiry</Label>
								<Input
									maxLength={5}
									onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
									placeholder="MM/YY"
									value={cardExpiry}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>CVV</Label>
								<Input
									maxLength={3}
									onChange={(e) => setCardCvv(e.target.value.slice(0, 3))}
									placeholder="•••"
									type="password"
									value={cardCvv}
								/>
							</div>
						</div>
					</TabsContent>

					{/* Debit Card — same fields */}
					<TabsContent className="space-y-4" value="debit_card">
						<div className="space-y-1.5">
							<Label>Card Number</Label>
							<Input
								maxLength={19}
								onChange={(e) => setCardNumber(formatCard(e.target.value))}
								placeholder="1234 5678 9012 3456"
								value={cardNumber}
							/>
						</div>
						<div className="space-y-1.5">
							<Label>Cardholder Name</Label>
							<Input
								onChange={(e) => setCardName(e.target.value)}
								placeholder="Name on card"
								value={cardName}
							/>
						</div>
						<div className="grid grid-cols-2 gap-3">
							<div className="space-y-1.5">
								<Label>Expiry</Label>
								<Input
									maxLength={5}
									onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
									placeholder="MM/YY"
									value={cardExpiry}
								/>
							</div>
							<div className="space-y-1.5">
								<Label>CVV</Label>
								<Input
									maxLength={3}
									onChange={(e) => setCardCvv(e.target.value.slice(0, 3))}
									placeholder="•••"
									type="password"
									value={cardCvv}
								/>
							</div>
						</div>
					</TabsContent>

					{/* Wallet */}
					<TabsContent className="space-y-4" value="wallet">
						<div className="space-y-1.5">
							<Label>Registered Mobile Number</Label>
							<Input
								onChange={(e) =>
									setWalletPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
								}
								placeholder="10-digit mobile number"
								value={walletPhone}
							/>
						</div>
						<p className="text-muted-foreground text-xs">
							OTP will be sent to your registered number
						</p>
					</TabsContent>
				</Tabs>

				<Separator className="my-4" />

				<div className="mb-4 flex items-center justify-between text-sm">
					<span className="text-muted-foreground">Total Payable</span>
					<span className="font-bold text-lg">₹{amount}</span>
				</div>

				<div className="flex gap-2">
					<Button
						className="flex-1"
						disabled={processing || isLoading}
						onClick={onCancel}
						variant="outline"
					>
						Cancel
					</Button>
					<Button
						className="flex-1 bg-amber-500 font-semibold text-white hover:bg-amber-600"
						disabled={processing || isLoading}
						onClick={handlePay}
					>
						Pay ₹{amount}
					</Button>
				</div>
				<p className="mt-3 text-center text-[10px] text-muted-foreground">
					🔒 Secured by BusSaathi Pay · SSL Encrypted
				</p>
			</CardContent>
		</Card>
	);
}
