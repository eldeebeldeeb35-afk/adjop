"""Voiceover v3 — Modern Standard Arabic (فصحى), rendered in every available voice."""
import numpy as np, soundfile as sf, sys
from piper import PiperVoice
from piper.config import SynthesisConfig

MA = [3.0, 8.0, 13.0]; MX = 18.0; BR = 20.0; RA = [21.6, 27.0, 32.5]; F = 38.0; END = 48.2
L = [
 (0.3, 2.95, 'في الأفلامِ والمسلسلاتِ، للمتديّنِ صورةٌ واحدةْ.'),
 (MA[0] + .4, MA[1] - .2, 'دائمًا عابسُ الوجهِ، منغلقٌ على نفسِهْ.'),
 (MA[1] + .3, MA[2] - .2, 'يصرخُ في الناسِ، ويخاصمُ الدنيا كلَّها.'),
 (MA[2] + .3, MX - .1, 'ويعيشُ وحيدًا، معزولًا عن الحياةْ.'),
 (MX + .15, BR, 'لكنَّ هذا ليسَ حقيقيًّا!'),
 (BR + .15, RA[0] - .05, 'فماذا عن الواقعْ؟'),
 (RA[0] + .3, RA[1] - .1, 'المتديّنُ الحقيقيُّ يصلّي ويصومُ ويقومُ الليلَ، وقلبُه مطمئنّْ.'),
 (RA[1] + .2, RA[2] - .1, 'يضحكُ ويمزحُ مع أصدقائِه، بل ويلعبونَ البلايستيشنَ أيضًا!'),
 (RA[2] + .2, F - .1, 'يحبُّ أهلَه ويبرُّهم، ويجتهدُ في دراستِه وعملِه، ويمارسُ الرياضةْ.'),
 (F + .35, F + 3.25, 'التديّنُ لم يكنْ يومًا تشدّدًا ولا انعزالًا.'),
 (F + 3.3, F + 4.55, 'القاعدةُ بسيطةْ:'),
 (F + 4.6, F + 6.35, 'الحياةُ، ما دامتْ لا تُغضبُ اللهَ،'),
 (F + 6.4, F + 7.4, 'فعِشْها!'),
]
VOICES = {'kareem': 'vits-piper-ar_JO-kareem-medium/ar_JO-kareem-medium.onnx',
          'miro': 'vits-piper-ar_JO-SA_miro-high/ar_JO-SA_miro-high.onnx',
          'miro_v2': 'vits-piper-ar_JO-SA_miro_V2-high/ar_JO-SA_miro_V2-high.onnx',
          'dii': 'vits-piper-ar_JO-SA_dii-high/ar_JO-SA_dii-high.onnx'}

for name in (sys.argv[1:] or VOICES):
    V = PiperVoice.load(VOICES[name]); SR = V.config.sample_rate
    def synth(text, ls):
        ph = sum(V.phonemize(text), [])
        a = V.phoneme_ids_to_audio(V.phonemes_to_ids(ph), SynthesisConfig(length_scale=ls, noise_scale=0.6, noise_w_scale=0.75))
        a = np.asarray(a, np.float32).flatten(); nz = np.nonzero(np.abs(a) > 0.004)[0]
        a = a[max(0, nz[0] - 200): nz[-1] + 900] if len(nz) else a
        return a / (np.abs(a).max() + 1e-9) * 0.9
    out = np.zeros(int((END + 1) * SR), np.float32); worst = []
    for st, en, txt in L:
        ls = 1.0; a = synth(txt, ls)
        while len(a) / SR > en - st and ls > 0.74:
            ls -= 0.04; a = synth(txt, ls)
        out[int(st * SR):int(st * SR) + len(a)] += a
        worst.append((round(len(a) / SR - (en - st), 2), round(ls, 2)))
    out = out[:int(END * SR)]
    sf.write(f'vo3_{name}.wav', out / np.abs(out).max() * 0.9, SR)
    print(name, 'over/ls per line:', worst)
