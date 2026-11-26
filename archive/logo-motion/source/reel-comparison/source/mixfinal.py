import numpy as np, soundfile as sf, sys
SR=44100; OFF=3.25; N=int((OFF+48.2)*SR)
def load(p):
    a,sr=sf.read(p,always_2d=True)
    if sr!=SR:
        x=np.arange(int(len(a)*SR/sr))/SR; a=np.stack([np.interp(x,np.arange(len(a))/sr,a[:,c]) for c in range(a.shape[1])],1)
    if a.shape[1]==1: a=np.repeat(a,2,1)
    return a
def at(a,t0):
    o=np.zeros((N,2)); i=int(t0*SR); s=a[:N-i]; o[i:i+len(s)]=s; return o
voice=sys.argv[1]
logo=at(load('logo_a.wav'),0); vo=at(load(f'../tts/vo3_{voice}.wav'),OFF); sfx=at(load('seq_sfx.wav'),OFF); aah=at(load('../tts/aahs.wav'),0)
logo*=np.clip((OFF+0.45-np.arange(N)/SR)/0.45,0,1)[:,None]
env=np.convolve(np.abs(vo[:,0]),np.ones(4410)/4410,'same'); duck=(1-0.55*np.clip(env/(env.max()*0.2),0,1))[:,None]
aah*=np.clip((np.arange(N)/SR-2.6)/1.2,0,1)[:,None]
n=lambda a:a/(np.abs(a).max()+1e-9)
m=n(vo)+n(sfx)*0.4+n(aah)*0.38*duck+n(logo)*0.8; m/=np.abs(m).max()/0.92; sf.write(f'mix_{voice}_aahs.wav',m,SR)
m=n(vo)+n(sfx)*0.4+n(logo)*0.8; m/=np.abs(m).max()/0.92; sf.write(f'mix_{voice}_noaahs.wav',m,SR)
print('ok')
