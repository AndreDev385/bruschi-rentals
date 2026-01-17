import { actions } from "astro:actions";
import { Loader2, Mail, Smartphone } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { PhoneInputComponent } from "@/components/ui/PhoneInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type LoginMethod = "phone" | "email";
type LoginStep = "input" | "code";

export const LoginForm: React.FC = () => {
	const [currentStep, setCurrentStep] = useState<LoginStep>("phone");
	const [phoneNumber, setPhoneNumber] = useState("");
	const [code, setCode] = useState("");
	const [isSendingCode, setIsSendingCode] = useState(false);
	const [isVerifyingCode, setIsVerifyingCode] = useState(false);

	const search = window.location.search;

	const handleSendCode = async () => {
		if (!phoneNumber.trim()) {
			toast.error("Please enter your phone number");
			return;
		}

		// Basic phone validation (E.164 format check)
		const phoneRegex = /^\+[1-9]\d{1,14}$/;
		if (!phoneRegex.test(phoneNumber.trim())) {
			toast.error("Please enter a valid phone number");
			return;
		}

		setIsSendingCode(true);
		try {
			const result = await actions.sendLoginCodeSMS({
				phoneNumber: phoneNumber.trim(),
			});

			if (result.data?.success) {
				toast.success("Code sent! Check your phone.");
				setCurrentStep("code");
			}
		} catch (error: unknown) {
			console.error("Send code error:", error);
			const message =
				error instanceof Error
					? error.message
					: "Failed to send code. Please try again.";

			// Special handling for service unavailable
			if (message.includes("unavailable") || message.includes("timeout")) {
				toast.error(message, {
					duration: 6000, // Show longer for important messages
				});
			} else {
				toast.error(message);
			}
		} finally {
			setIsSendingCode(false);
		}
	};

	const handleVerifyCode = async () => {
		if (!code.trim() || code.length !== 6) {
			toast.error("Please enter a valid 6-digit code");
			return;
		}

		setIsVerifyingCode(true);
		try {
			const response = await fetch("/api/auth/verify-code-sms", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					phoneNumber: phoneNumber.trim(),
					code: code.trim(),
				}),
			});

			if (response.redirected) {
				// Successful verification, redirect
				window.location.href = response.url;
			} else {
				const data = await response.json();
				throw new Error(data.error || "Invalid code");
			}
		} catch (error: unknown) {
			console.error("Verify error:", error);
			const message =
				error instanceof Error
					? error.message
					: "Invalid code. Please try again.";
			toast.error(message);
		} finally {
			setIsVerifyingCode(false);
		}
	};

	const handleBackToPhone = () => {
		setCurrentStep("phone");
		setCode("");
	};

	const handleCodeInput = (value: string) => {
		// Only allow digits
		const digitsOnly = value.replace(/\D/g, "");
		setCode(digitsOnly);
	};

	return (
		<div className="max-w-md bg-soft rounded-xl shadow-lg p-8">
			<div className="text-center mb-4">
				<h1 className="text-3xl font-bold text-obsidian mb-4">Welcome Back</h1>
				<p className="text-mocha">Access your personalized rental options</p>
			</div>

			{currentStep === "phone" && (
				<div className="space-y-4">
					<div>
						<Label htmlFor="phoneNumber">Phone Number</Label>
						<PhoneInputComponent
							name="phoneNumber"
							value={phoneNumber}
							onChange={(value) => setPhoneNumber(value)}
							required
							disabled={isSendingCode}
						/>
					</div>

					<Button
						type="button"
						onClick={handleSendCode}
						className="w-full font-bold"
						size="lg"
						disabled={isSendingCode}
					>
						{isSendingCode && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{isSendingCode ? "Sending..." : "Send Code"}
					</Button>
				</div>
			)}

			{currentStep === "code" && (
				<div className="space-y-6">
					<div className="text-center mb-4">
						<p className="text-sm text-mocha">
							We've sent a 6-digit code to <strong>{phoneNumber}</strong>. Enter
							it below to continue.
						</p>
					</div>

					<div>
						<Label htmlFor="code">
							<Input
								type="text"
								id="code"
								value={code}
								onChange={(e) => handleCodeInput(e.target.value)}
								required
								maxLength={6}
								pattern="[0-9]{6}"
								className="text-center text-2xl tracking-widest font-mono"
								placeholder="000000"
								disabled={isVerifyingCode}
								autoFocus
							/>
						</Label>
					</div>

					<Button
						type="button"
						onClick={handleVerifyCode}
						disabled={isVerifyingCode}
						className="w-full font-bold"
						size="lg"
					>
						{isVerifyingCode && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						)}
						{isVerifyingCode ? "Verifying..." : "Verify Code"}
					</Button>

					<Button
						type="button"
						onClick={handleBackToPhone}
						disabled={isVerifyingCode}
						className="w-full font-bold"
						variant="link"
					>
						← Back to phone number
					</Button>
				</div>
			)}

			<div className="mt-6 text-center">
				<p className="text-sm text-mocha">
					New here?{" "}
					<a
						href={`/more-info${search}`}
						className="text-primary hover:underline"
					>
						Get started
					</a>
				</p>
			</div>
		</div>
	);
};
