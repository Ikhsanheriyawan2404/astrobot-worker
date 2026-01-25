export const buildUrl = (template: string, code: string) =>
  template.replace("{code}", code);