import cv2,numpy as np
im=cv2.imread('hand_src.jpg'); H,W=im.shape[:2]
hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV).astype(np.float32)
S=cv2.GaussianBlur(hsv[...,1],(0,0),1.2)
a=np.clip((S-12)/18,0,1)
# marker polygon
p0=np.array([1426,597.]);p1=np.array([1962,832.]); L=np.linalg.norm(p1-p0); d=(p1-p0)/L; n=np.array([-d[1],d[0]])
prof=[(0,7),(15,12),(40,20),(55,30),(80,38),(200,40),(380,44),(420,50),(L,50)]
up=[p0+d*s+n*w for s,w in prof]; lo=[p0+d*s-n*w for s,w in prof][::-1]
poly=np.array(up+lo).astype(np.int32)
mk=np.zeros((H,W),np.uint8); cv2.fillPoly(mk,[poly],255); mk=cv2.GaussianBlur(mk,(0,0),1.0)/255.
a=np.maximum(a,mk)
b=(a>0.5).astype(np.uint8)
b=cv2.morphologyEx(b,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
n_,lab,st,_=cv2.connectedComponentsWithStats(b); k=1+np.argmax(st[1:,4]); b=(lab==k).astype(np.uint8)
# fill holes
inv=(1-b).astype(np.uint8); n2,l2,s2,_=cv2.connectedComponentsWithStats(inv)
for i in range(1,n2):
    x,y,w,h,area=s2[i]
    if x>0 and y>0 and x+w<W and y+h<H: b[l2==i]=1
b=cv2.morphologyEx(b,cv2.MORPH_CLOSE,np.ones((7,7),np.uint8))
soft=cv2.GaussianBlur(b.astype(np.float32),(0,0),1.3)
alpha=np.clip((soft-0.15)/0.7,0,1)
x,y,w,h=cv2.boundingRect(b)
rgba=np.dstack([im,(alpha*255).astype(np.uint8)])[y:y+h,x:x+w]
cv2.imwrite('img/hand_real.png',rgba)
print('bbox',x,y,w,h,'tip_in_crop',p0[0]-x,p0[1]-y)
bg=np.full((h,w,3),(60,140,60),np.uint8); al=alpha[y:y+h,x:x+w,None]
cv2.imwrite('hand_check.jpg',cv2.resize((im[y:y+h,x:x+w]*al+bg*(1-al)).astype(np.uint8),None,fx=.5,fy=.5))
