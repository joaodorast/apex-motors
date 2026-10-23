import { useId, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageIntro } from '../components/Blocks';
import { Picture } from '../components/Picture';
import { MODELS, isModelSlug } from '../data/models';
import { usePageMeta } from '../hooks/usePageMeta';

/**
 * Integração de envio: defina VITE_CONTACT_ENDPOINT (ex.: uma função serverless) para que o formulário
 * faça um POST JSON real. Sem essa variável, nenhum envio é simulado — o usuário é informado.
 */
const ENDPOINT = (import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined)?.trim() || '';

const SUBJECTS = ['Informações sobre a linha', 'Minha configuração', 'Imprensa e design', 'Outro assunto'] as const;

interface FormState {
  name: string;
  email: string;
  phone: string;
  model: string;
  subject: string;
  message: string;
  consent: boolean;
  website: string; // honeypot
}

type Errors = Partial<Record<keyof FormState, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = 'Informe seu nome completo.';
  if (!EMAIL.test(f.email.trim())) e.email = 'Informe um e-mail válido, como nome@dominio.com.';
  if (f.phone.trim() && f.phone.replace(/\D/g, '').length < 10) e.phone = 'Telefone incompleto: inclua DDD e número.';
  if (!f.model) e.model = 'Selecione o modelo de interesse.';
  if (f.message.trim().length < 20) e.message = `Escreva pelo menos 20 caracteres (faltam ${20 - f.message.trim().length}).`;
  if (!f.consent) e.consent = 'É preciso autorizar o uso dos dados para responder.';
  return e;
}

const LABELS: Record<keyof FormState, string> = {
  name: 'Nome',
  email: 'E-mail',
  phone: 'Telefone',
  model: 'Modelo de interesse',
  subject: 'Assunto',
  message: 'Mensagem',
  consent: 'Consentimento',
  website: '',
};

export default function Contact() {
  usePageMeta('Contato', 'Fale com o atelier APEX MOTORS: escolha o modelo de interesse e envie sua mensagem. Projeto conceitual.');
  const [params] = useSearchParams();
  const configCode = params.get('config')?.slice(0, 40) ?? '';
  const preModel = params.get('m');
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    model: isModelSlug(preModel) ? preModel : '',
    subject: configCode ? SUBJECTS[1] : SUBJECTS[0],
    message: configCode ? `Gostaria de conversar sobre a configuração ${configCode}.` : '',
    consent: false,
    website: '',
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error' | 'no-backend'>('idle');
  const [copied, setCopied] = useState(false);

  const errors = validate(form);
  const show = (k: keyof FormState) => (submitted || touched[k]) && errors[k];
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (status === 'no-backend' || status === 'error') setStatus('idle');
  };
  const blur = (k: keyof FormState) => setTouched((t) => ({ ...t, [k]: true }));

  const payloadText = () =>
    [
      `Nome: ${form.name}`,
      `E-mail: ${form.email}`,
      form.phone && `Telefone: ${form.phone}`,
      `Modelo: ${MODELS.find((m) => m.slug === form.model)?.name ?? 'Ainda não decidi'}`,
      `Assunto: ${form.subject}`,
      configCode && `Configuração: ${configCode}`,
      '',
      form.message,
    ]
      .filter((l): l is string => typeof l === 'string' && l !== '')
      .join('\n');

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validate(form);
    if (Object.keys(errs).length) {
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    if (form.website) return; // provável robô
    if (!ENDPOINT) {
      setStatus('no-backend');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: undefined, configCode: configCode || undefined, source: 'apex-motors-site' }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
      formRef.current?.reset();
    } catch {
      setStatus('error');
    }
  };

  const errorList = Object.entries(errors) as [keyof FormState, string][];
  const fieldId = (k: string) => `${id}-${k}`;
  const describedBy = (k: keyof FormState, extra?: string) => [show(k) ? `${fieldId(k)}-err` : '', extra].filter(Boolean).join(' ') || undefined;

  if (status === 'sent') {
    return (
      <div className="container-x flex min-h-[80svh] flex-col justify-center pt-32">
        <p className="eyebrow text-volt">Mensagem enviada</p>
        <h1 className="display mt-6 text-[clamp(2.6rem,8vw,7rem)]">Obrigado.</h1>
        <p className="mt-6 max-w-xl text-lg text-silver" role="status">
          Recebemos sua mensagem pelo endpoint configurado. A resposta depende da integração definida para este site.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageIntro eyebrow="Contato" title="Fale com" light="o atelier.">
        Conte qual modelo despertou seu interesse e o que gostaria de saber. Os campos marcados com * são obrigatórios.
      </PageIntro>

      <div className="container-x grid gap-14 pb-24 sm:pb-32 lg:grid-cols-12">
        <form ref={formRef} noValidate onSubmit={onSubmit} className="lg:col-span-7" aria-describedby={`${id}-note`}>
          {submitted && errorList.length > 0 && (
            <div ref={summaryRef} tabIndex={-1} role="alert" className="mb-8 border-l-2 border-volt bg-volt/8 p-5 outline-none">
              <p className="font-semibold">Revise {errorList.length === 1 ? 'o campo abaixo' : `os ${errorList.length} campos abaixo`}:</p>
              <ul className="mt-3 space-y-1 text-sm text-silver">
                {errorList.map(([k, msg]) => (
                  <li key={k}>
                    <a href={`#${fieldId(k)}`} className="underline decoration-volt/60 underline-offset-4 hover:text-paper">
                      {LABELS[k]}
                    </a>
                    : {msg}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={fieldId('name')} className="eyebrow mb-2 block text-paper">
                Nome *
              </label>
              <input id={fieldId('name')} className="field" autoComplete="name" value={form.name} onChange={(e) => set('name', e.target.value)} onBlur={() => blur('name')} aria-invalid={!!show('name')} aria-describedby={describedBy('name')} required />
              {show('name') && <p id={`${fieldId('name')}-err`} className="mt-2 text-sm text-volt">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor={fieldId('email')} className="eyebrow mb-2 block text-paper">
                E-mail *
              </label>
              <input id={fieldId('email')} type="email" inputMode="email" className="field" autoComplete="email" value={form.email} onChange={(e) => set('email', e.target.value)} onBlur={() => blur('email')} aria-invalid={!!show('email')} aria-describedby={describedBy('email')} required />
              {show('email') && <p id={`${fieldId('email')}-err`} className="mt-2 text-sm text-volt">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor={fieldId('phone')} className="eyebrow mb-2 block text-paper">
                Telefone <span className="normal-case tracking-normal text-mute">(opcional)</span>
              </label>
              <input id={fieldId('phone')} type="tel" inputMode="tel" className="field" autoComplete="tel" placeholder="(00) 00000-0000" value={form.phone} onChange={(e) => set('phone', e.target.value)} onBlur={() => blur('phone')} aria-invalid={!!show('phone')} aria-describedby={describedBy('phone')} />
              {show('phone') && <p id={`${fieldId('phone')}-err`} className="mt-2 text-sm text-volt">{errors.phone}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={fieldId('model')} className="eyebrow mb-2 block text-paper">
                Modelo de interesse *
              </label>
              <div className="relative">
                <select id={fieldId('model')} className="field pr-12" value={form.model} onChange={(e) => set('model', e.target.value)} onBlur={() => blur('model')} aria-invalid={!!show('model')} aria-describedby={describedBy('model')} required>
                  <option value="">Selecione…</option>
                  {MODELS.map((m) => (
                    <option key={m.slug} value={m.slug}>
                      {m.name} — {m.category}
                    </option>
                  ))}
                  <option value="undecided">Ainda não decidi</option>
                </select>
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-silver" aria-hidden="true">
                  ↓
                </span>
              </div>
              {show('model') && <p id={`${fieldId('model')}-err`} className="mt-2 text-sm text-volt">{errors.model}</p>}
            </div>
            <fieldset className="sm:col-span-2">
              <legend className="eyebrow mb-3 block text-paper">Assunto</legend>
              <div className="flex flex-wrap gap-2">
                {SUBJECTS.map((s) => (
                  <label key={s} className="chip cursor-pointer has-[:checked]:bg-paper has-[:checked]:text-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-volt">
                    <input type="radio" name="subject" value={s} checked={form.subject === s} onChange={() => set('subject', s)} className="sr-only" />
                    {s}
                  </label>
                ))}
              </div>
            </fieldset>
            {configCode && (
              <div className="sm:col-span-2">
                <p className="eyebrow mb-2 text-paper">Configuração vinculada</p>
                <p className="field flex items-center font-mono text-sm text-silver">{configCode}</p>
              </div>
            )}
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-baseline justify-between">
                <label htmlFor={fieldId('message')} className="eyebrow block text-paper">
                  Mensagem *
                </label>
                <span id={`${fieldId('message')}-count`} className="micro text-mute">
                  {form.message.length}/1000
                </span>
              </div>
              <textarea
                id={fieldId('message')}
                className="field min-h-44 resize-y"
                maxLength={1000}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                onBlur={() => blur('message')}
                aria-invalid={!!show('message')}
                aria-describedby={describedBy('message', `${fieldId('message')}-count`)}
                required
              />
              {show('message') && <p id={`${fieldId('message')}-err`} className="mt-2 text-sm text-volt">{errors.message}</p>}
            </div>
            {/* Honeypot invisível para robôs */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor={fieldId('website')}>Site</label>
              <input id={fieldId('website')} tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set('website', e.target.value)} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor={fieldId('consent')} className="flex cursor-pointer items-start gap-4">
                <input
                  id={fieldId('consent')}
                  type="checkbox"
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                  onBlur={() => blur('consent')}
                  aria-invalid={!!show('consent')}
                  aria-describedby={describedBy('consent')}
                  className="mt-0.5 h-5 w-5 shrink-0 accent-[#FF3048]"
                />
                <span className="text-sm leading-relaxed text-silver">Autorizo o uso destes dados exclusivamente para responder a esta mensagem. *</span>
              </label>
              {show('consent') && <p id={`${fieldId('consent')}-err`} className="mt-2 text-sm text-volt">{errors.consent}</p>}
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
            <button type="submit" className="btn btn-primary" disabled={status === 'sending'}>
              {status === 'sending' ? 'Enviando…' : 'Enviar mensagem'}
              {status !== 'sending' && (
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              )}
            </button>
            <p id={`${id}-note`} className="text-sm text-mute">
              {ENDPOINT ? 'Sua mensagem será enviada ao endpoint configurado.' : 'Envio online ainda não configurado nesta versão do site.'}
            </p>
          </div>

          <div aria-live="polite" className="mt-6">
            {status === 'no-backend' && (
              <div className="border border-silver/20 bg-graphite p-6" role="status">
                <p className="font-semibold text-paper">Sua mensagem está pronta, mas não foi enviada.</p>
                <p className="mt-2 text-sm leading-relaxed text-silver">
                  Este site ainda não tem um serviço de envio conectado (variável <code className="font-mono text-paper">VITE_CONTACT_ENDPOINT</code>). Nenhum dado saiu do seu navegador. Você pode copiar o texto para enviar por outro canal.
                </p>
                <button
                  type="button"
                  className="btn btn-ghost mt-5"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(payloadText());
                      setCopied(true);
                    } catch {
                      setCopied(false);
                    }
                  }}
                >
                  {copied ? 'Mensagem copiada' : 'Copiar mensagem'}
                </button>
              </div>
            )}
            {status === 'error' && (
              <p className="border-l-2 border-volt p-4 text-sm text-silver" role="alert">
                Não foi possível enviar agora. Verifique sua conexão e tente novamente — seus dados continuam no formulário.
              </p>
            )}
          </div>
        </form>

        <aside className="lg:col-span-4 lg:col-start-9" aria-label="Informações">
          <div className="sticky top-28">
            <div className="aspect-[4/3] overflow-hidden">
              <Picture name="eon-light" alt="Linha de luz frontal do APEX EON" sizes="(min-width: 1024px) 30vw, 100vw" className="block h-full w-full" imgClassName="h-full w-full object-cover" />
            </div>
            <dl className="mt-8 space-y-6">
              <div>
                <dt className="micro text-mute">Atendimento</dt>
                <dd className="mt-2 text-silver">Projeto conceitual — não há showroom, telefone ou endereço físico associados à marca.</dd>
              </div>
              <div>
                <dt className="micro text-mute">Privacidade</dt>
                <dd className="mt-2 text-silver">Os dados do formulário só são transmitidos se um endpoint de envio estiver configurado.</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </>
  );
}
