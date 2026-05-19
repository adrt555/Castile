import SpecbooksQuoteTemplate from "@/app/components/SpecbooksQuoteTemplate";

export const metadata = {
  title: "Specbooks Quote Template - Preview",
};

export default function SpecbooksPreviewPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <SpecbooksQuoteTemplate />
    </main>
  );
}
