import Link from 'next/link';

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface ContactInfo {
  phone: string;
  email: string;
  address: string[];
}

const FOOTER_SECTIONS: FooterSection[] = [
  {
    title: "About Company",
    links: [
      { label: "ABOUT US", href: "#" },
      { label: "JEWELLERY GUIDE", href: "#" },
      { label: "CAREER", href: "#" },
      { label: "BLOG", href: "#" },
    ]
  },
  {
    title: "Policies",
    links: [
      { label: "PRIVACY POLICY", href: "#" },
      { label: "TERMS OF USE", href: "#" },
    ]
  },
  {
    title: "Help",
    links: [
      { label: "FAQ'S", href: "#" },
      { label: "CONTACT US", href: "#" },
    ]
  }
];

const CONTACT_INFO: ContactInfo = {
  phone: "+977- 97230 98500",
  email: "info@celebrationdiamon.com",
  address: [
    "NB Center, New Baneshwor",
    "near Sankhamul Road,",
    "Kathmandu, Nepal"
  ]
};

export default function Footer() {
  return (
    <footer className="bg-[#f2f2f2] pt-16 pb-8 text-gray-800 font-sans md:px-16" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Render dynamic sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-bold mb-6  tan-agean">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm md:text-lg font-medium text-black uppercase hover:text-amber-600 transition-colors duration-200 cabinet"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* DIRECT CONTACT */}
          <div>
            <h3 className="text-sm font-bold mb-6  tan-agean">Direct Contact</h3>
            <ul className="space-y-4">
              <li>
                <p className="text-sm md:text-md font-medium text-black uppercase cabinet">{CONTACT_INFO.phone}</p>
              </li>
              <li>
                <p className="text-sm md:text-md font-medium text-black uppercase break-all">{CONTACT_INFO.email}</p>
              </li>
              <li>
                <address className="not-italic">
                  <p className="text-sm md:text-md font-medium text-black uppercase leading-relaxed">
                    {CONTACT_INFO.address.map((line, index) => (
                      <span key={index}>
                        {line}
                        <br />
                      </span>
                    ))}
                  </p>
                </address>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center ">
          <p className="text-xs md:text-md text-black font-medium uppercase">
            &copy; {new Date().getFullYear()} Celebration Diamonds. ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}