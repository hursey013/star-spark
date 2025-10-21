import { ReminderDigest } from '../services/reminderService.js';

interface RenderOptions {
  digest: ReminderDigest;
  username: string;
}

const styles = {
  body: 'bg-slate-950 text-sky-100 font-sans',
  card: 'bg-slate-900/80 border border-slate-800 rounded-2xl shadow-lg shadow-sky-900/40',
  button: 'inline-flex items-center justify-center rounded-full bg-sky-400 text-slate-950 font-semibold px-5 py-2 text-sm no-underline'
};

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charSet="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Star Spark Digest</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap');
      body { margin: 0; font-family: 'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #020617; color: #e0f2fe; }
      .${styles.card.replace(/ /g, '.')} { background: rgba(15, 23, 42, 0.9); border-radius: 24px; border: 1px solid rgba(51, 65, 85, 0.8); padding: 24px; }
      a { color: inherit; }
    </style>
  </head>
  <body class="${styles.body}">
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style="padding: 32px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellPadding="0" cellSpacing="0" style="width: 600px; max-width: 90%;">
            <tr>
              <td style="padding: 0 0 32px 0; text-align: center;">
                <span style="display: inline-flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 700; letter-spacing: 0.03em;">
                  ✨ Star Spark
                </span>
              </td>
            </tr>
            ${content}
            <tr>
              <td style="padding-top: 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
                You are receiving this email because you asked Star Spark to keep your GitHub stars aglow.<br />
                Want to dial things differently? <a href="{{settingsUrl}}" style="color: #38bdf8;">Update your cadence</a> or <a href="{{goodbyeUrl}}" style="color: #38bdf8;">snooze Star Spark</a> anytime.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

const renderRepo = (repo: ReminderDigest['highlights'][number]['items'][number]) => `
<tr>
  <td style="padding: 16px 0;">
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" class="${styles.card}">
      <tr>
        <td style="padding-bottom: 12px; font-size: 16px; font-weight: 600;">
          <a href="${repo.htmlUrl}" style="color: #38bdf8; text-decoration: none;">${repo.fullName}</a>
        </td>
      </tr>
      <tr>
        <td style="color: #cbd5f5; font-size: 14px; line-height: 1.6;">
          ${repo.description ?? 'You bookmarked this project for a reason — rediscover the spark!'}
        </td>
      </tr>
      <tr>
        <td style="padding-top: 12px; font-size: 12px; color: #94a3b8;">
          <strong>Vibe:</strong> ${repo.vibe}<br />
          <strong>Language:</strong> ${repo.language ?? 'Multi-language nebula'} • <strong>Stars:</strong> ${repo.stargazers}
        </td>
      </tr>
    </table>
  </td>
</tr>
`;

export const renderReminderEmail = ({ digest, username }: RenderOptions) => {
  const sections = digest.highlights
    .map((highlight) => `
      <tr>
        <td style="padding-bottom: 8px;">
          <h2 style="margin: 0; font-size: 20px; color: #bae6fd;">${highlight.title}</h2>
          <p style="margin: 4px 0 0; color: #94a3b8; font-size: 14px; line-height: 1.6;">${highlight.tagline}</p>
        </td>
      </tr>
      ${highlight.items.map((repo) => renderRepo(repo)).join('')}
    `)
    .join('');

  const content = `
    <tr>
      <td class="${styles.card}" style="padding: 32px;">
        <p style="margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 0.2em; font-size: 12px; color: #38bdf8;">${digest.title}</p>
        <h1 style="margin: 0 0 12px 0; font-size: 28px; color: #f8fafc;">Hello ${username}, your constellation is calling.</h1>
        <p style="margin: 0; color: #cbd5f5; font-size: 16px; line-height: 1.6;">${digest.intro}</p>
      </td>
    </tr>
    ${sections}
    <tr>
      <td style="padding-top: 24px; text-align: center;">
        <a href="{{openAppUrl}}" class="${styles.button}">Open Star Spark</a>
      </td>
    </tr>
  `;

  return baseTemplate(content);
};
