import Navbar from "@/components/landing/Navbar";
import Waitlist from "@/components/landing/Waitlist";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "Request a Demo — ATP-Go",
  description: "Join the waitlist and get your institution onboarded with ATP-Go in under a week.",
};

export default function WaitlistDemoPage() {
  return (
    <>
      <Navbar />
      <main style={{ paddingTop: "72px" }}>
        <Waitlist />
      </main>
      <Footer />
    </>
  );
}
