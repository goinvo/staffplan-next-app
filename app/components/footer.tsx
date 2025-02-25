import Link from "next/link"
import React from "react";

const footerItems = [
  { href: "", label: "Copyright" },
  { href: "", label: "\u00A9\u00A02025" },
  { href: "https://goinvo.com/", label: "GoInvo." },
  { href: "", label: "All rights reserved." },
  {
    href: "https://github.com/goinvo/staffplan-next-app/blob/master/privacy.md#privacy-policy",
    label: "Privacy Policy",
  },
  { href: "", label: "and" },
  {
    href: "https://github.com/goinvo/staffplan-next-app/blob/master/privacy.md#terms-of-use",
    label: "Terms of Use",
  },
  {
    href: "https://github.com/goinvo/staffplan-next-app",
    label: "Open Source",
  },
  { href: "mailto:staffplan@goinvo.com", label: "Feedback" },
];

const Footer: React.FC = () => {
  return (
    <footer className="w-full navbar flex justify-start align-middle px-4 py-2">
      <div className="leading-[10px]">
        {footerItems.map((item, index) => (
          <React.Fragment key={index}>
            {item.href ? (
              <Link
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline mx-[2px] text-2xs text-contrastGrey [&:nth-child(n+7):nth-last-child(n+1)]:ml-[4px] [&:nth-child(n+7):nth-last-child(n+1)]:pr-2 [&:nth-child(n+7):nth-last-child(n+2)]:bg-[linear-gradient(to_right,_transparent_99%,_theme(colors.contrastGrey)_1%)]"
              >
                {item.label}
              </Link>
            ) : (
              <span
                key={index}
                className="relative inline mx-[2px] text-2xs text-contrastGrey [&:nth-child(n+7):nth-last-child(n+1)]:ml-[4px] [&:nth-child(n+7):nth-last-child(n+1)]:pr-2 [&:nth-child(n+7):nth-last-child(n+2)]:bg-[linear-gradient(to_right,_transparent_99%,_theme(colors.contrastGrey)_1%)]"
              >
                {item.label}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
    </footer>
  );
};

export default Footer
