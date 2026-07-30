export const organizationStructuredData = {
  "@context": "https://schema.org",
  "@type": "GovernmentOrganization",
  name: "DESA CIJAMBE",
  url: "https://desacijambe.example",
  logo: "https://desacijambe.example/images/desa.png",
  sameAs: [
    "https://www.facebook.com/desacijambe",
    "https://www.instagram.com/desacijambe",
    "https://twitter.com/desacijambe"
  ],
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+62 812 3456 7890",
      contactType: "customer service",
      areaServed: "ID",
      availableLanguage: ["Indonesian"]
    }
  ],
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kantor Desa Cijambe",
    addressLocality: "Desa Cijambe",
    addressRegion: "Jawa Barat",
    postalCode: "", 
    addressCountry: "ID"
  },
};
