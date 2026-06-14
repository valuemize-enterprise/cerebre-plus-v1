// /lib/email/templates.ts
// All Cerebre Plus email templates.
// Returns { subject, html } ready for Resend.
// Uses inline CSS — the only reliable approach for email clients.

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://cerebreplus.com'

// ── Shared layout wrapper ──────────────────────────────────────
function layout(content: string, preheader = ''): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Cerebre Plus</title>
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#080F1F;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#080F1F;">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

        <!-- HEADER -->
        <tr>
          <td style="background:#0B1F3A;border-radius:16px 16px 0 0;padding:28px 36px 20px;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td>
                  <span style="font-family:Georgia,serif;font-size:22px;font-weight:900;color:#EBF2FC;letter-spacing:2px;">CEREBRE</span>
                  <span style="font-family:Georgia,serif;font-size:22px;font-weight:900;color:#F5B830;letter-spacing:2px;"> PLUS</span>
                </td>
                <td align="right">
                  <span style="font-size:11px;color:#6B84A0;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;">AI Marketing Platform</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- CONTENT -->
        <tr>
          <td style="background:#0D2040;padding:36px 36px 28px;">
            ${content}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#0B1F3A;border-radius:0 0 16px 16px;padding:20px 36px;">
            <p style="margin:0 0 8px;font-size:11px;color:#6B84A0;text-align:center;">
              Cerebre Plus · Cerebre Media Africa · Lagos, Nigeria
            </p>
            <p style="margin:0;font-size:11px;color:#6B84A0;text-align:center;">
              <a href="${BASE_URL}/settings?tab=notifications" style="color:#6B84A0;text-decoration:underline;">Manage notifications</a>
              &nbsp;·&nbsp;
              <a href="${BASE_URL}" style="color:#6B84A0;text-decoration:underline;">cerebreplus.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

// Shared helpers
const h1 = (text: string) =>
  `<h1 style="margin:0 0 12px;font-family:Georgia,serif;font-size:26px;font-weight:900;color:#EBF2FC;line-height:1.3;">${text}</h1>`
const h2 = (text: string) =>
  `<h2 style="margin:20px 0 8px;font-family:Georgia,serif;font-size:18px;font-weight:700;color:#EBF2FC;">${text}</h2>`
const para = (text: string, muted = false) =>
  `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:${muted ? '#8FA5BE' : '#C5D5E8'};">${text}</p>`
const cta = (text: string, url: string, color = '#E09818') =>
  `<a href="${url}" style="display:inline-block;margin:8px 0 0;padding:13px 28px;background:${color};border-radius:10px;font-family:Arial,sans-serif;font-size:14px;font-weight:800;color:${color === '#E09818' ? '#071528' : '#EBF2FC'};text-decoration:none;">${text}</a>`
const divider = () =>
  `<hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:20px 0;">`
const stat = (value: string, label: string) =>
  `<td style="text-align:center;padding:0 16px;">
    <div style="font-family:Georgia,serif;font-size:28px;font-weight:900;color:#F5B830;">${value}</div>
    <div style="font-size:11px;color:#6B84A0;margin-top:4px;">${label}</div>
  </td>`
const chip = (text: string, color = '#12D4B4') =>
  `<span style="display:inline-block;padding:3px 12px;border-radius:20px;background:${color}22;border:1px solid ${color}44;font-size:11px;font-weight:700;color:${color};letter-spacing:1px;text-transform:uppercase;">${text}</span>`


// ══════════════════════════════════════════════════════════════
// 1. WELCOME EMAIL
// ══════════════════════════════════════════════════════════════
export function welcomeEmail(params: { name: string; coins: number }) {
  const { name, coins } = params
  return {
    subject: `Welcome to Cerebre Plus, ${name.split(' ')[0]} 🎉`,
    html: layout(`
      ${h1(`Welcome, ${name.split(' ')[0]}. Your marketing team just arrived.`)}
      ${para('You now have access to the AI marketing platform built exclusively for Nigerian businesses. Here\'s everything you need to get started in the next 10 minutes.')}
      ${divider()}
      ${h2('Your first three moves')}
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">
        ${[
          ['01', 'Complete Brand Setup', 'Add your colors, font style, and logo. Every design you create will automatically match your brand.', `${BASE_URL}/brand-settings`],
          ['02', 'Run your first tool', 'Try CaptionCraft — generate Instagram captions for a week in under 60 seconds.', `${BASE_URL}/tools`],
          ['03', 'Try Competitor Intel', 'Discover what your competitors are doing on social media and in their ads — with live data.', `${BASE_URL}/competitor-intelligence`],
        ].map(([n, title, desc, url]) => `
          <tr>
            <td style="padding:10px 0;vertical-align:top;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="background:#132845;border-radius:10px;padding:14px 16px;width:100%;">
                <tr>
                  <td style="vertical-align:top;padding-right:12px;width:28px;">
                    <div style="width:28px;height:28px;border-radius:50%;background:#12D4B422;border:1px solid #12D4B444;display:flex;align-items:center;justify-content:center;">
                      <span style="font-size:11px;font-weight:900;color:#12D4B4;">${n}</span>
                    </div>
                  </td>
                  <td>
                    <div style="font-size:13px;font-weight:700;color:#EBF2FC;margin-bottom:4px;">${title}</div>
                    <div style="font-size:12px;color:#8FA5BE;line-height:1.5;">${desc}</div>
                    <a href="${url}" style="display:inline-block;margin-top:8px;font-size:12px;font-weight:700;color:#F5B830;text-decoration:none;">Get started →</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>`).join('')}
      </table>
      <table role="presentation" style="background:#132845;border-radius:10px;padding:16px;width:100%;margin:0 0 16px;">
        <tr>
          <td style="text-align:center;">
            <div style="font-size:36px;font-weight:900;font-family:Georgia,serif;color:#F5B830;">${coins}</div>
            <div style="font-size:12px;color:#6B84A0;margin-top:2px;">coins in your account — ready to spend</div>
          </td>
        </tr>
      </table>
      ${cta('Start using Cerebre Plus →', `${BASE_URL}/dashboard`)}
    `, `Welcome to Cerebre Plus — your AI marketing team is ready`)
  }
}


// ══════════════════════════════════════════════════════════════
// 2. WEEKLY DIGEST
// ══════════════════════════════════════════════════════════════
export function weeklyDigestEmail(params: {
  name:         string
  weekEnding:   string
  toolsUsed:    number
  outputsCreated:number
  coinsSpent:   number
  coinsRemaining:number
  topTool:      string | null
  upcomingSmeSession: { title: string; date: string } | null
  suggestedTool:{ name: string; description: string; href: string } | null
}) {
  const { name, weekEnding, toolsUsed, outputsCreated, coinsSpent, coinsRemaining, topTool, upcomingSmeSession, suggestedTool } = params
  const firstName = name.split(' ')[0]
  const lowCoins  = coinsRemaining < 30

  return {
    subject: `Your Cerebre Plus week in review — ${weekEnding}`,
    html: layout(`
      ${chip('WEEKLY DIGEST')}
      <div style="height:12px;"></div>
      ${h1(`Good week, ${firstName}.`)}
      ${para(outputsCreated > 0
        ? `You created ${outputsCreated} marketing output${outputsCreated !== 1 ? 's' : ''} this week. Here's your summary.`
        : `You haven't created anything this week. That's okay — let's change that.`
      )}
      ${divider()}

      <!-- STATS -->
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
        <tr>
          ${stat(String(outputsCreated), 'outputs created')}
          ${stat(String(toolsUsed),       'tools used')}
          ${stat(String(coinsSpent),      'coins spent')}
          ${stat(String(coinsRemaining),  'coins left')}
        </tr>
      </table>

      ${topTool ? `
        <div style="background:#132845;border-radius:10px;padding:14px 16px;margin:0 0 16px;">
          <div style="font-size:11px;font-weight:700;color:#6B84A0;letter-spacing:1px;text-transform:uppercase;margin-bottom:6px;">Most used this week</div>
          <div style="font-size:15px;font-weight:700;color:#EBF2FC;">${topTool}</div>
        </div>` : ''}

      ${lowCoins ? `
        ${divider()}
        <div style="background:#E0981822;border-radius:10px;padding:14px 16px;margin:0 0 16px;border-left:3px solid #E09818;">
          <div style="font-size:13px;font-weight:700;color:#F5B830;margin-bottom:4px;">⚡ Your coins are getting low</div>
          <div style="font-size:12px;color:#8FA5BE;margin-bottom:10px;">You have ${coinsRemaining} coins remaining. Top up to keep creating without interruption.</div>
          <a href="${BASE_URL}/billing" style="font-size:12px;font-weight:700;color:#F5B830;text-decoration:none;">Top up coins →</a>
        </div>` : ''}

      ${upcomingSmeSession ? `
        ${divider()}
        ${h2('SME Club — New Session Available')}
        <div style="background:#12D4B412;border-radius:10px;padding:14px 16px;margin:0 0 16px;border-left:3px solid #12D4B4;">
          <div style="font-size:13px;font-weight:700;color:#12D4B4;margin-bottom:4px;">${upcomingSmeSession.title}</div>
          <div style="font-size:12px;color:#8FA5BE;margin-bottom:10px;">Available ${upcomingSmeSession.date}</div>
          <a href="${BASE_URL}/sme-club" style="font-size:12px;font-weight:700;color:#12D4B4;text-decoration:none;">Watch session →</a>
        </div>` : ''}

      ${suggestedTool ? `
        ${divider()}
        ${h2('Try this next')}
        <div style="background:#132845;border-radius:10px;padding:14px 16px;margin:0 0 20px;">
          <div style="font-size:13px;font-weight:700;color:#EBF2FC;margin-bottom:4px;">${suggestedTool.name}</div>
          <div style="font-size:12px;color:#8FA5BE;margin-bottom:10px;">${suggestedTool.description}</div>
          <a href="${BASE_URL}${suggestedTool.href}" style="font-size:12px;font-weight:700;color:#F5B830;text-decoration:none;">Try it →</a>
        </div>` : ''}

      ${cta('Open Cerebre Plus →', `${BASE_URL}/dashboard`)}
    `, `Your Cerebre Plus week — ${outputsCreated} outputs, ${coinsSpent} coins spent`)
  }
}


// ══════════════════════════════════════════════════════════════
// 3. COIN ALERT
// ══════════════════════════════════════════════════════════════
export function coinAlertEmail(params: { name: string; balance: number; planTier: string }) {
  const { name, balance, planTier } = params
  const firstName = name.split(' ')[0]
  const isCritical = balance < 10

  return {
    subject: `⚡ Your Cerebre Plus coins are ${isCritical ? 'almost gone' : 'running low'} — ${balance} remaining`,
    html: layout(`
      ${chip(isCritical ? '⚡ CRITICAL' : '⚡ LOW BALANCE', '#E09818')}
      <div style="height:12px;"></div>
      ${h1(`${firstName}, you have ${balance} coin${balance !== 1 ? 's' : ''} left.`)}
      ${para(isCritical
        ? 'You\'re about to run out. Top up now to avoid interruption to your content creation.'
        : `Your coin balance is running low. Most tools cost 10–30 coins — top up to keep creating without interruption.`
      )}
      ${divider()}
      <table role="presentation" style="width:100%;margin:0 0 20px;">
        <tr>
          <td style="background:#132845;border-radius:10px;padding:20px;text-align:center;">
            <div style="font-family:Georgia,serif;font-size:48px;font-weight:900;color:${isCritical ? '#EF4444' : '#F5B830'};">${balance}</div>
            <div style="font-size:13px;color:#6B84A0;margin-top:4px;">coins remaining on ${planTier} plan</div>
          </td>
        </tr>
      </table>
      ${para('Top up with a coin pack, or upgrade your plan for a larger annual allocation.')}
      ${cta('Top up coins →', `${BASE_URL}/billing#coins`)}
      <div style="height:10px;"></div>
      <a href="${BASE_URL}/billing#upgrade" style="display:inline-block;margin:0;padding:12px 24px;background:transparent;border:1px solid #6B84A050;border-radius:10px;font-size:13px;font-weight:700;color:#8FA5BE;text-decoration:none;">View upgrade options →</a>
    `, `You have ${balance} Cerebre Plus coins remaining`)
  }
}


// ══════════════════════════════════════════════════════════════
// 4. NEW SME CLUB SESSION
// ══════════════════════════════════════════════════════════════
export function smeNewSessionEmail(params: {
  name:       string
  session:    { number: number; title: string; description: string; category: string; duration: number; isFreePreview: boolean }
}) {
  const { name, session } = params
  const firstName = name.split(' ')[0]

  return {
    subject: `SME Club Session ${session.number}: ${session.title}`,
    html: layout(`
      ${chip('SME CLUB', '#12D4B4')}
      <div style="height:12px;"></div>
      ${h1(`Session ${session.number} is live, ${firstName}.`)}
      ${para(`A new SME Club masterclass is available. ${session.isFreePreview ? 'This session is free — no Growth plan required.' : 'Available to all Growth plan subscribers.'}`)}
      ${divider()}
      <div style="background:#12D4B412;border-radius:12px;padding:20px;margin:0 0 20px;border:1px solid #12D4B430;">
        <div style="font-size:11px;font-weight:700;color:#12D4B4;letter-spacing:1px;text-transform:uppercase;margin-bottom:8px;">
          Session ${session.number} · ${session.category.replace('-', ' ')} · ${session.duration} min
        </div>
        <div style="font-family:Georgia,serif;font-size:20px;font-weight:700;color:#EBF2FC;margin-bottom:10px;">${session.title}</div>
        <div style="font-size:13px;color:#8FA5BE;line-height:1.6;">${session.description}</div>
      </div>
      ${cta('Watch the session →', `${BASE_URL}/sme-club`, '#12D4B4')}
    `, `SME Club Session ${session.number}: ${session.title} is now available`)
  }
}


// ══════════════════════════════════════════════════════════════
// 5. COMPETITOR INTEL COMPLETE (heavy analysis notification)
// ══════════════════════════════════════════════════════════════
export function competitorCompleteEmail(params: {
  name:        string
  sessionId:   string
  competitors: string[]
  modulesCount:number
  coinsSpent:  number
}) {
  const { name, sessionId, competitors, modulesCount, coinsSpent } = params
  const firstName = name.split(' ')[0]

  return {
    subject: `Your competitor analysis is ready — ${competitors[0]} and ${competitors.length - 1} more`,
    html: layout(`
      ${chip('COMPETITOR INTEL 2.0', '#8B5CF6')}
      <div style="height:12px;"></div>
      ${h1(`Your analysis is ready, ${firstName}.`)}
      ${para(`Your Competitor Intelligence report has finished processing. ${modulesCount} module${modulesCount !== 1 ? 's' : ''} analysed across ${competitors.length} competitor${competitors.length !== 1 ? 's' : ''}.`)}
      ${divider()}
      <div style="background:#8B5CF612;border-radius:10px;padding:16px;margin:0 0 16px;">
        <div style="font-size:12px;font-weight:700;color:#6B84A0;margin-bottom:10px;letter-spacing:1px;text-transform:uppercase;">Competitors analysed</div>
        ${competitors.map(c => `<div style="font-size:13px;color:#EBF2FC;padding:3px 0;">✦ ${c}</div>`).join('')}
        <div style="height:10px;"></div>
        <div style="font-size:12px;color:#6B84A0;">${modulesCount} modules · ${coinsSpent} coins</div>
      </div>
      ${para('Open your report to see insights, cross-competitor patterns, and the specific Cerebre Plus tools recommended for each finding.')}
      ${cta('View full report →', `${BASE_URL}/competitor-intelligence/${sessionId}`, '#8B5CF6')}
    `, 'Your Competitor Intelligence report is ready to view')
  }
}


// ══════════════════════════════════════════════════════════════
// 6. PLAN UPGRADE CONFIRMATION
// ══════════════════════════════════════════════════════════════
export function planUpgradeEmail(params: { name: string; plan: string; coins: number; amount: string }) {
  const { name, plan, coins, amount } = params
  const firstName = name.split(' ')[0]

  return {
    subject: `You're on ${plan} — welcome to the full platform ✦`,
    html: layout(`
      ${h1(`${firstName}, you're in.`)}
      ${para(`Your ${plan} subscription is active. You now have ${coins} coins and access to every tool on the platform.`)}
      ${divider()}
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin:0 0 20px;">
        <tr>
          ${stat(String(coins), 'coins this year')}
          ${stat(plan, 'plan tier')}
          ${stat(amount, 'paid today')}
        </tr>
      </table>
      ${h2('What unlocked today')}
      ${['All 40+ AI marketing tools', 'All 11 design tools (Standard + Premium)', 'Competitor Intelligence 2.0 — Enhanced mode with live data', plan === 'Growth' ? 'SME Club weekly masterclasses' : 'Competitor Intel in Base mode', 'Priority support'].map(f =>
        `<div style="padding:6px 0;font-size:13px;color:#EBF2FC;"><span style="color:#22C55E;margin-right:8px;">✓</span>${f}</div>`
      ).join('')}
      <div style="height:20px;"></div>
      ${cta('Start using your plan →', `${BASE_URL}/dashboard`)}
    `, `Your ${plan} subscription is now active`)
  }
}


// ══════════════════════════════════════════════════════════════
// 7. REFERRAL REWARD
// ══════════════════════════════════════════════════════════════
export function referralRewardEmail(params: { name: string; referredName: string; coinsEarned: number; totalBalance: number }) {
  const { name, referredName, coinsEarned, totalBalance } = params
  const firstName = name.split(' ')[0]

  return {
    subject: `You earned ${coinsEarned} coins — ${referredName} just joined Cerebre Plus`,
    html: layout(`
      ${chip('REFERRAL REWARD', '#22C55E')}
      <div style="height:12px;"></div>
      ${h1(`Nice one, ${firstName}. ${coinsEarned} coins just landed.`)}
      ${para(`${referredName} signed up using your referral link. As promised, ${coinsEarned} coins have been added to your account.`)}
      ${divider()}
      <table role="presentation" style="width:100%;margin:0 0 20px;">
        <tr>
          ${stat(`+${coinsEarned}`, 'coins earned')}
          ${stat(String(totalBalance), 'total balance')}
        </tr>
      </table>
      ${para('Keep sharing your referral link — every person who signs up earns you more coins. No limit.', true)}
      ${cta('Share your link →', `${BASE_URL}/referral`)}
    `, `You earned ${coinsEarned} coins for referring ${referredName}`)
  }
}
