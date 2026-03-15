"use client";

import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Phone, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContactForm } from "@/components/contact/ContactForm";
import { useLocale } from "@/components/providers/LocaleProvider";

export function ContactPageContent() {
  const { t } = useLocale();
  return (
    <div className="min-h-[calc(100vh-var(--header-height,80px))] py-16 lg:py-24">
      <div className="container mx-auto px-6 lg:px-12 max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors mb-12"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("contactPage.backHome")}
        </Link>

        <h1 className="font-display text-4xl lg:text-5xl font-bold text-[var(--foreground)] tracking-tight mb-4">
          {t("contactPage.heading")}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mb-14">
          {t("contactPage.intro")}
        </p>

        <div className="grid lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] text-lg">
                  {t("contactPage.whereWeAre")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4">
                  <MapPin className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">Yara & Co.</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t("footer.location")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contactPage.addressByAppointment")}
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Mail className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{t("contactPage.emailLabel")}</p>
                    <a
                      href="mailto:contacto@yaraandco.com"
                      className="text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors"
                    >
                      contacto@yaraandco.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Phone className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">{t("contactPage.phone")}</p>
                    <a
                      href="tel:+34900000000"
                      className="text-sm text-muted-foreground hover:text-[var(--gold)] transition-colors"
                    >
                      +34 900 000 000
                    </a>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="h-5 w-5 text-[var(--gold)] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-[var(--foreground)]">
                      {t("contactPage.customerService")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contactPage.hoursWeekdays")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t("contactPage.hoursSaturday")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3">
            <Card className="rounded-2xl border-[var(--border)] bg-[var(--card)]">
              <CardHeader>
                <CardTitle className="text-[var(--foreground)] text-lg">
                  {t("contactPage.sendMessage")}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {t("contactPage.formIntro")}
                </p>
              </CardHeader>
              <CardContent>
                <ContactForm />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
