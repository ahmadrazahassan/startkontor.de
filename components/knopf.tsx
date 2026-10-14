import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "@/components/icons";
import type { IconName } from "@/components/icons";
import { ui } from "@/lib/daten";

type Variante = "primaer" | "sekundaer" | "tertiaer";

type Gemeinsam = {
  variante?: Variante;
  klein?: boolean;
  icon?: IconName;
  /** Icon vor dem Text statt dahinter */
  iconLinks?: boolean;
  breit?: boolean;
  children: ReactNode;
  className?: string;
};

function klassen({ variante = "primaer", klein, breit, className }: Gemeinsam): string {
  return [
    "knopf",
    `knopf_${variante}`,
    klein ? "knopf_klein" : "",
    breit ? "knopf_breit" : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

function Inhalt({ icon, iconLinks, children }: Pick<Gemeinsam, "icon" | "iconLinks" | "children">) {
  return (
    <>
      {icon && iconLinks ? <Icon name={icon} groesse={18} /> : null}
      <span className="knopf__text">{children}</span>
      {icon && !iconLinks ? <Icon name={icon} groesse={18} /> : null}
    </>
  );
}

export function KnopfLink(
  props: Gemeinsam & {
    href: string;
    /** Externer Link: neuer Tab, Hinweis für Screenreader */
    extern?: boolean;
    /** Anzeigepflichtig als Werbung (nur bei aktivem Partner) */
    werbung?: boolean;
    ariaLabel?: string;
  },
) {
  const { href, extern, werbung, ariaLabel } = props;
  if (extern || werbung) {
    const rel = werbung ? "sponsored noopener noreferrer" : "noopener noreferrer";
    return (
      <a href={href} className={klassen(props)} target="_blank" rel={rel} aria-label={ariaLabel}>
        <Inhalt icon={props.icon ?? "external"} iconLinks={props.iconLinks}>
          {props.children}
        </Inhalt>
        {werbung ? <span className="knopf__werbung">Werbung</span> : null}
        <span className="visuell_versteckt"> ({ui.barrierefreiheit.externLink})</span>
      </a>
    );
  }
  return (
    <Link href={href} className={klassen(props)} aria-label={ariaLabel}>
      <Inhalt icon={props.icon} iconLinks={props.iconLinks}>
        {props.children}
      </Inhalt>
    </Link>
  );
}

export function Knopf(props: Gemeinsam & ButtonHTMLAttributes<HTMLButtonElement>) {
  const { variante, klein, icon, iconLinks, breit, children, className, type = "button", ...rest } = props;
  return (
    <button type={type} className={klassen({ variante, klein, breit, className, children })} {...rest}>
      <Inhalt icon={icon} iconLinks={iconLinks}>
        {children}
      </Inhalt>
    </button>
  );
}
