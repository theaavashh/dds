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
      { label: "ABOUT US", href: "/about" },
      { label: "JEWELLERY GUIDE", href: "#" },
      { label: "CAREER", href: "#" },
      { label: "BLOG", href: "#" },
    ]
  },
  {
    title: "Policies",
    links: [
      { label: "PRIVACY POLICY", href: "/privacy-policy" },
      { label: "TERMS OF USE", href: "/terms-conditions" },
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
  phone: "+977- 9709196495",
  email: "celebrationdiamonds369@gmail.com",
  address: [
    "Nb Center, New Baneshwor",
    "near Sankhamul Road,",
    "Kathmandu, Nepal"
  ]
};

export default function Footer() {
  return (
    <footer className="bg-[#C5BC9A] pt-10 pb-4 text-gray-800 font-sans md:px-16" role="contentinfo">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {/* Render dynamic sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-xl font-semibold mb-6 tan-agean text-black">{section.title}</h3>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-md md:text-lg font-semibold leading-wide text-black uppercase hover:text-amber-600 transition-colors duration-200"
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
            <h3 className="text-xl font-bold mb-6 tan-agean text-black">Direct Contact</h3>
            <ul className="space-y-2">
              <li>
                <p className="text-md md:text-md font-medium text-black">{CONTACT_INFO.phone}</p>
              </li>
              <li>
                <p className="text-md md:text-md font-medium text-black break-all">{CONTACT_INFO.email}</p>
              </li>
              <li>
                <address className="not-italic">
                  <p className="text-md md:text-md font-medium text-black leading-relaxed">
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
          <p className="text-xs md:text-md text-black font-extrabold tan-agean">
            &copy; {new Date().getFullYear()} Celebration Diamonds.<br className="md:hidden " /> ALL RIGHTS RESERVED
          </p>
        </div>
      </div>
    </footer>
  );
}