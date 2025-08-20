import React, { useState } from "react";

interface Plan {
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

const plans: Plan[] = [
  {
    name: "Basic",
    monthlyPrice: 100,
    annualPrice: 90,
    features: [
      "Project Management Features",
      "Resource Utilization",
      "Dashboards",
      "Gantt Charts & Roadmaps",
      "Single Sign-On (SSO) with Microsoft and Okta",
    ],
  },
  {
    name: "Pro",
    monthlyPrice: 150,
    annualPrice: 135,
    features: [
      "All Basic Features",
      "Budget Forecasting",
      "Import via Spreadsheet",
      "Customer SMTP Integration",
      "ChatBot/Support",
    ],
  },
  {
    name: "Premium",
    monthlyPrice: 200,
    annualPrice: 180,
    features: [
      "All Pro Features",
      "JIRA/Monday/Smartsheet Integration",
      "Customer Managed Encryption",
      "Dedicated Support",
    ],
  },
];

const SubscriptionModel: React.FC = () => {
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");

  return (
    <div className="w-full px-6 md:px-12 py-12 flex flex-col items-center max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
          Our Plan and Pricing
        </h2>
        <p className="text-lg text-gray-500 mb-4">
          Try free for 30 days. No credit card required.
        </p>

        {/* Billing Toggle */}
        <div className="flex bg-gray-200 rounded-full p-1 w-64 mx-auto">
          <button
            className={`flex-1 py-2 rounded-full font-semibold transition ${
              billing === "monthly"
                ? "bg-[#044086] text-white"
                : "text-gray-600"
            }`}
            onClick={() => setBilling("monthly")}
          >
            Monthly
          </button>
          <button
            className={`flex-1 py-2 rounded-full font-semibold transition ${
              billing === "annual"
                ? "bg-[#044086] text-white"
                : "text-gray-600"
            }`}
            onClick={() => setBilling("annual")}
          >
            Annually (10% off)
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="flex flex-wrap justify-center gap-6">
        {plans.map((plan, index) => (
          <PricingCard key={index} plan={plan} billing={billing} />
        ))}
      </div>
    </div>
  );
};

interface PricingCardProps {
  plan: Plan;
  billing: "monthly" | "annual";
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, billing }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-lg transition w-full sm:w-[280px] md:w-[320px] lg:w-[350px] flex flex-col min-h-[450px]">
      <div className="p-6 flex flex-col flex-1">
        {/* Title + Price */}
        <h3 className="text-xl font-bold text-gray-800 mb-3">{plan.name}</h3>
        <p className="text-3xl font-bold text-[#0b72b9] mb-5">
          ${billing === "monthly" ? plan.monthlyPrice : plan.annualPrice}
          <span className="text-sm text-gray-500">/mo</span>
        </p>

        {/* Features */}
        <div className="flex-1 border-t border-gray-200 pt-4 mb-6">
          {plan.features.map((feature, idx) => (
            <div
              key={idx}
              className="flex items-center py-2 border-b border-gray-100 last:border-0"
            >
              <span className="mr-2 text-green-500">✔️</span>
              <span className="text-gray-700">{feature}</span>
            </div>
          ))}
        </div>

        {/* Button */}
        <button
          onClick={() => alert(`Starting free trial for ${plan.name} plan!`)}
          className="w-full bg-[#044086] text-white font-bold py-3 rounded-md hover:bg-[#0550b8] transition"
        >
          Start Free Trial
        </button>
      </div>
    </div>
  );
};

export default SubscriptionModel;
