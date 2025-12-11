"use client";

import { FileText, CheckCircle2, Scale, Users } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Navigation } from "./Navigation";
import { Footer } from "./Footer";
import { ContactForm } from "./ContactForm";

export function TermsOfService() {
  const router = useRouter();
  const [contactFormOpen, setContactFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navigation 
        onBack={() => router.push("/")}
        onNavigate={(page) => {
          if (page === 'contact') {
            setContactFormOpen(true);
          } else {
            router.push(`/${page}`);
          }
        }}
        onLogoClick={() => router.push("/")}
        showBackButton={false}
      />

      {/* Hero Section */}
      <section className="px-4 md:px-8 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-6"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-primary/10 rounded-full mb-4">
              <FileText className="w-5 h-5 text-primary" strokeWidth={2} />
              <span className="text-sm text-primary" style={{ fontWeight: 500 }}>Terms & Conditions</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight" style={{ fontWeight: 600, lineHeight: 1.2 }}>
              Terms of Service
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" style={{ lineHeight: 1.7 }}>
              Clear guidelines for using Pinpoint AI
            </p>
            
            <p className="text-sm text-muted-foreground">
              Last Updated: December 3rd, 2025
            </p>
          </motion.div>
        </div>
      </section>

      {/* Introduction */}
      <section className="px-4 md:px-8 py-8 bg-accent/5">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Fair Use</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Reasonable guidelines for accessing our platform</p>
            </div>
            
            <div className="bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                <Scale className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Legal Protection</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Protecting both our users and our platform</p>
            </div>
            
            <div className="bg-card rounded-[20px] p-6 border border-border/30 hover:border-primary/40 transition-all duration-300">
              <div className="w-12 h-12 rounded-[12px] bg-primary/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg mb-2" style={{ fontWeight: 600 }}>Community First</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Built with the AI community in mind</p>
            </div>
          </motion.div>
          
          <div className="bg-card rounded-[20px] p-8 border border-border/30">
            <p className="text-foreground/85 mb-4" style={{ lineHeight: 1.8 }}>
              Welcome to Pinpoint AI. These Terms of Service govern your access to and use of the Pinpoint AI website, located at <a href="https://pinpointai.tools" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://pinpointai.tools</a>, which provides discovery, evaluation, scoring, and benchmarking of artificial intelligence tools. By using our site, you agree to these Terms.
            </p>
            <p className="text-foreground/85 mb-4" style={{ lineHeight: 1.8 }}>
              Pinpoint AI is operated by <span style={{ fontWeight: 500 }}>Module Creative LLC</span>
            </p>
            <p className="text-foreground/85" style={{ lineHeight: 1.8, fontWeight: 500 }}>
              If you do not agree with these Terms, please do not use the site.
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 pb-20">
        <div className="space-y-12">
          {/* Section 1 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              1. Description of Service
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                Pinpoint AI is a curated AI tool directory that offers:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6 mb-4">
                <li style={{ lineHeight: 1.8 }}>• Human verified tool reviews</li>
                <li style={{ lineHeight: 1.8 }}>• Feature evaluations and scoring</li>
                <li style={{ lineHeight: 1.8 }}>• Market insights and competitive comparisons</li>
                <li style={{ lineHeight: 1.8 }}>• Tool listing submissions and recheck services</li>
                <li style={{ lineHeight: 1.8 }}>• Paid sponsorship opportunities such as Alpha Bar placement</li>
                <li style={{ lineHeight: 1.8 }}>• Premium content and subscription based features</li>
              </ul>
              <p className="text-foreground/85" style={{ lineHeight: 1.8, fontWeight: 500 }}>
                Pinpoint AI does not provide guarantees of accuracy or performance for any third party tool listed on the site.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              2. Eligibility
            </h2>
            
            <div className="pl-4 space-y-2 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                You must be at least 13 years old to use Pinpoint AI.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                The site is intended primarily for users located in the United States.
              </p>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              3. Use of the Website
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                By using Pinpoint AI, you agree to:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6 mb-4">
                <li style={{ lineHeight: 1.8 }}>• Use the site only for lawful purposes</li>
                <li style={{ lineHeight: 1.8 }}>• Not scrape, copy, or reproduce content without permission</li>
                <li style={{ lineHeight: 1.8 }}>• Not interfere with the security or operation of the site</li>
                <li style={{ lineHeight: 1.8 }}>• Not submit false or misleading information when requesting listings or rechecks</li>
              </ul>
              <p className="text-foreground/85" style={{ lineHeight: 1.8, fontWeight: 500 }}>
                We reserve the right to restrict or terminate access for violations.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              4. Tool Listings and Rechecks
            </h2>
            
            <div className="space-y-6 pl-4">
              <div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 500 }}>
                  4.1 Submissions
                </h3>
                <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                  Tool creators may submit their product to be evaluated and listed. By submitting:
                </p>
                <ul className="space-y-2 text-foreground/85 pl-6">
                  <li style={{ lineHeight: 1.8 }}>• You confirm you have rights to the information provided</li>
                  <li style={{ lineHeight: 1.8 }}>• You grant Pinpoint AI permission to publish details, reviews, scoring, and evaluations</li>
                  <li style={{ lineHeight: 1.8 }}>• You understand that evaluations are performed independently and cannot be altered or influenced by payment</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 500 }}>
                  4.2 Rechecks
                </h3>
                <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                  Paid rechecks involve re-evaluating your tool's updated features. Payment does not guarantee a score increase or positive outcome.
                </p>
              </div>

              <div>
                <h3 className="text-xl mb-3" style={{ fontWeight: 500 }}>
                  4.3 Removal Requests
                </h3>
                <p className="text-foreground/85 mb-2" style={{ lineHeight: 1.8 }}>
                  If you wish to remove or modify your tool's listing, contact us at <a href="mailto:human@pinpointai.tools" className="text-primary hover:underline">human@pinpointai.tools</a>.
                </p>
                <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                  We may accept or deny removal requests at our discretion to maintain transparency and historical accuracy.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              5. Sponsorships and Paid Placement
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                Pinpoint AI offers promotional placements such as Alpha Bar Sponsorships. These placements:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6">
                <li style={{ lineHeight: 1.8 }}>• Provide visibility but do not guarantee traffic or conversions</li>
                <li style={{ lineHeight: 1.8 }}>• Do not influence scoring, ranking, or editorial judgment</li>
                <li style={{ lineHeight: 1.8 }}>• Are non-refundable unless otherwise stated</li>
              </ul>
            </div>
          </section>

          {/* Section 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              6. Premium Features and Subscriptions
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                Certain features, such as:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6 mb-4">
                <li style={{ lineHeight: 1.8 }}>• Competitive landscape insights</li>
                <li style={{ lineHeight: 1.8 }}>• Market worth estimates</li>
                <li style={{ lineHeight: 1.8 }}>• Benchmark scoring</li>
                <li style={{ lineHeight: 1.8 }}>• Website traction metrics using external APIs</li>
                <li style={{ lineHeight: 1.8 }}>• Periodic recheck subscriptions</li>
              </ul>
              <p className="text-foreground/85 mb-2" style={{ lineHeight: 1.8 }}>
                may require paid membership.
              </p>
              <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                Subscriptions renew automatically unless canceled. All billing is handled through third party payment providers. Pinpoint AI does not store payment card details.
              </p>
            </div>
          </section>

          {/* Section 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              7. Intellectual Property
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                All content on Pinpoint AI, including:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6 mb-4">
                <li style={{ lineHeight: 1.8 }}>• Scoring systems</li>
                <li style={{ lineHeight: 1.8 }}>• Tool evaluations</li>
                <li style={{ lineHeight: 1.8 }}>• Market data analysis</li>
                <li style={{ lineHeight: 1.8 }}>• UI design</li>
                <li style={{ lineHeight: 1.8 }}>• Logos and branding</li>
                <li style={{ lineHeight: 1.8 }}>• Written descriptions and benchmarks</li>
              </ul>
              <p className="text-foreground/85 mb-2" style={{ lineHeight: 1.8 }}>
                is the property of <span style={{ fontWeight: 500 }}>Module Creative LLC</span> unless stated otherwise.
              </p>
              <p className="text-foreground/85" style={{ lineHeight: 1.8, fontWeight: 500 }}>
                You may not copy, republish, mirror, or resell content from Pinpoint AI without written permission.
              </p>
            </div>
          </section>

          {/* Section 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              8. Accuracy and Disclaimer
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                Pinpoint AI aims to provide accurate and up to date information, but:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6 mb-4">
                <li style={{ lineHeight: 1.8 }}>• We do not guarantee completeness, accuracy, or reliability</li>
                <li style={{ lineHeight: 1.8 }}>• Scores and evaluations are subjective and based on internal criteria</li>
                <li style={{ lineHeight: 1.8 }}>• External data sources may contain errors or delays</li>
                <li style={{ lineHeight: 1.8 }}>• Market worth estimates and projections are for informational purposes only and should not be considered financial advice</li>
              </ul>
              <p className="text-foreground/85" style={{ lineHeight: 1.8, fontWeight: 500 }}>
                Use the site at your own risk.
              </p>
            </div>
          </section>

          {/* Section 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              9. Third Party Links
            </h2>
            
            <div className="pl-4 space-y-2 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                Pinpoint AI includes links to third party services and tools.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                We do not control or endorse these external websites.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                Your interactions with them are governed by their own policies and terms.
              </p>
            </div>
          </section>

          {/* Section 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              10. Limitation of Liability
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                To the fullest extent permitted by law, Pinpoint AI and Module Creative LLC are not liable for:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6 mb-4">
                <li style={{ lineHeight: 1.8 }}>• Losses resulting from use or inability to use the site</li>
                <li style={{ lineHeight: 1.8 }}>• Errors in data or evaluations</li>
                <li style={{ lineHeight: 1.8 }}>• Decisions made based on Pinpoint AI rankings or insights</li>
                <li style={{ lineHeight: 1.8 }}>• Indirect, incidental, or consequential damages</li>
              </ul>
              <p className="text-foreground/85" style={{ lineHeight: 1.8, fontWeight: 500 }}>
                Your sole remedy for dissatisfaction with the service is to stop using the site.
              </p>
            </div>
          </section>

          {/* Section 11 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              11. Indemnification
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                You agree to indemnify and hold Pinpoint AI harmless from any claims arising from:
              </p>
              <ul className="space-y-2 text-foreground/85 pl-6">
                <li style={{ lineHeight: 1.8 }}>• Your misuse of the site</li>
                <li style={{ lineHeight: 1.8 }}>• Your violation of these Terms</li>
                <li style={{ lineHeight: 1.8 }}>• Your submitted content for listings or rechecks</li>
              </ul>
            </div>
          </section>

          {/* Section 12 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              12. Changes to the Terms
            </h2>
            
            <div className="pl-4 space-y-2 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                We may update these Terms from time to time. Updates will be posted on this page with a new date.
              </p>
              <p style={{ lineHeight: 1.8, fontWeight: 500 }}>
                Continued use of the site means you accept the updated Terms.
              </p>
            </div>
          </section>

          {/* Section 13 */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              13. Governing Law
            </h2>
            
            <div className="pl-4 space-y-2 text-foreground/85">
              <p style={{ lineHeight: 1.8 }}>
                These Terms are governed by the laws of the State of California.
              </p>
              <p style={{ lineHeight: 1.8 }}>
                Any disputes will be handled in state or federal courts located in California.
              </p>
            </div>
          </section>

          {/* Section 14 - Contact */}
          <section className="space-y-4">
            <h2 className="text-2xl tracking-tight" style={{ fontWeight: 600 }}>
              14. Contact Us
            </h2>
            
            <div className="pl-4">
              <p className="text-foreground/85 mb-3" style={{ lineHeight: 1.8 }}>
                If you have questions about these Terms, contact:
              </p>
              <div className="p-6 bg-secondary/30 rounded-[16px] space-y-2">
                <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                  <span style={{ fontWeight: 500 }}>Email:</span> <a href="mailto:human@pinpointai.tools" className="text-primary hover:underline">human@pinpointai.tools</a>
                </p>
                <p className="text-foreground/85" style={{ lineHeight: 1.8 }}>
                  <span style={{ fontWeight: 500 }}>Website:</span> <a href="https://pinpointai.tools" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://pinpointai.tools</a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <Footer onContactClick={() => setContactFormOpen(true)} />

      {/* Contact Form Modal */}
      <ContactForm open={contactFormOpen} onOpenChange={setContactFormOpen} />
    </div>
  );
}

