import { Building2 } from "lucide-react";
import { appConfig } from "../config/appConfig";
import { routes } from "../config/routes";
export function Brand({ link = false }: { link?: boolean }) {
  const content = (
    <>
      <Building2 />
      {appConfig.brand.name}
      <span>{appConfig.brand.tagline}</span>
    </>
  );
  return link ? (
    <a className="brand" href={routes.dashboard}>
      {content}
    </a>
  ) : (
    <div className="brand">{content}</div>
  );
}
