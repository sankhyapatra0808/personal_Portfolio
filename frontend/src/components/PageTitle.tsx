import { useEffect } from "react";

type PageTitleProps = {
  title: string;
  description?: string;
};

export default function PageTitle({ title, description }: PageTitleProps) {
  useEffect(() => {
    document.title = title;

    if (description) {
      const meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      meta?.setAttribute("content", description);
    }
  }, [description, title]);

  return null;
}
