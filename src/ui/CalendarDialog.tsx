import { shortDate } from '../domain/dates';
import { eventBody, eventTitle, outlookComposeUrl, type OutlookAccount } from '../domain/calendar';
import { countdownText, type PlantState } from '../domain/watering';
import { Modal } from './Modal';
import { Icon } from './icons';

interface Props {
  states: PlantState[];
  today: string;
  time: string;
  account: OutlookAccount;
  outdated: boolean;
  downloadedBefore: boolean;
  appUrl: string;
  onTime(t: string): void;
  onAccount(a: OutlookAccount): void;
  onDownload(): void;
  onCopied(msg: string): void;
  onClose(): void;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand?.('copy') ?? false;
    ta.remove();
    return ok;
  }
}

export function CalendarDialog({ states, today, time, account, outdated, downloadedBefore, appUrl, onTime, onAccount, onDownload, onCopied, onClose }: Props) {
  const linkFor = (s: PlantState) => {
    const date = s.nextDue < today ? today : s.nextDue;
    return outlookComposeUrl({
      account, date, time,
      subject: eventTitle(s.plant.name, s.amountMl),
      body: eventBody(s.amountMl, s.type.careNote, appUrl),
    });
  };

  return (
    <Modal title="Watering reminders" onClose={onClose} wide>
      <div className="modal__body cal">
        {outdated && downloadedBefore && (
          <p className="banner banner--warn" role="status"><Icon name="alert" size={16} /> Your calendar is out of date. Download it again.</p>
        )}

        <div className="field-row">
          <div className="field">
            <label htmlFor="cal-time">Reminder time</label>
            <input id="cal-time" type="time" value={time} onChange={(e) => e.target.value && onTime(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="cal-account">Outlook account</label>
            <select id="cal-account" value={account} onChange={(e) => onAccount(e.target.value as OutlookAccount)}>
              <option value="work">Work or school (Microsoft 365)</option>
              <option value="personal">Personal (Outlook.com)</option>
            </select>
          </div>
        </div>

        <section className="cal__section">
          <h3>All plants, next 12 months</h3>
          <p className="muted">One reminder per planned watering, with the amount for that season. Works with Outlook, Apple Calendar and Google Calendar.</p>
          <button type="button" className="btn btn--primary" onClick={onDownload} disabled={states.length === 0}>
            <Icon name="download" size={16} /> Download calendar file
          </button>
          {states.length === 0 && <p className="hint">Add a plant first.</p>}
          <details className="cal__how">
            <summary>How to add it to Outlook</summary>
            <ol>
              <li>In Outlook on the web, open <strong>Calendar</strong> and create a new calendar called <strong>Plants</strong>.</li>
              <li>Choose <strong>Add calendar → Upload from file</strong>, pick <code>plant-watering.ics</code> and import it into <strong>Plants</strong>.</li>
              <li>When this page says the calendar is out of date, delete the <strong>Plants</strong> calendar, create it again and repeat step 2. That avoids duplicate reminders.</li>
            </ol>
            <p className="muted">Outlook desktop: double-click the file and choose to open it as a new calendar.</p>
          </details>
        </section>

        {states.length > 0 && (
          <section className="cal__section">
            <h3>Copy a link for one plant</h3>
            <p className="muted">Opens Outlook with the next watering filled in. Paste the link anywhere, e.g. in a note on your phone.</p>
            <ul className="cal__list">
              {states.map((s) => {
                const url = linkFor(s);
                return (
                  <li key={s.plant.id} className="cal__row">
                    <span className="cal__plant">
                      <strong>{s.plant.name}</strong>
                      <span className="muted">{shortDate(s.nextDue < today ? today : s.nextDue)} · {countdownText(s.daysLeft)}</span>
                    </span>
                    <button type="button" className="btn btn--small" onClick={async () => onCopied((await copyText(url)) ? `Outlook link for ${s.plant.name} copied` : 'Could not copy the link')}>
                      <Icon name="copy" size={15} /> Copy Outlook link
                    </button>
                    <a className="btn btn--small btn--ghost" href={url} target="_blank" rel="noopener noreferrer" aria-label={`Open Outlook event for ${s.plant.name}`}>
                      <Icon name="external" size={15} /> Open
                    </a>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <p className="fineprint">
          Reminders assume you water on the due date. A live, self-updating calendar link needs a small server (planned for the Raspberry Pi version), so for now you download the file again when your schedule changes.
        </p>
      </div>
    </Modal>
  );
}
