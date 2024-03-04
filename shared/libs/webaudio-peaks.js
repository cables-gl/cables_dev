var webaudioPeaks=function(e){function n(t){if(a[t])return a[t].exports;var r=a[t]={exports:{},id:t,loaded:!1};return e[t].call(r.exports,r,r.exports,n),r.loaded=!0,r.exports}var a={};return n.m=e,n.c=a,n.p="",n(0)}([function(module,exports){"use strict";function findMinMax(e){for(var n,a=1/0,t=-(1/0),r=0,i=e.length;i>r;r++)n=e[r],a>n&&(a=n),n>t&&(t=n);return{min:a,max:t}}function convert(e,n){var a=Math.pow(2,n-1),t=0>e?e*a:e*a-1;return Math.max(-a,Math.min(a-1,t))}function extractPeaks(channel,samplesPerPixel,bits){var i,chanLength=channel.length,numPeaks=Math.ceil(chanLength/samplesPerPixel),start,end,segment,max,min,extrema,peaks=new(eval("Int"+bits+"Array"))(2*numPeaks);for(i=0;numPeaks>i;i++)start=i*samplesPerPixel,end=(i+1)*samplesPerPixel>chanLength?chanLength:(i+1)*samplesPerPixel,segment=channel.subarray(start,end),extrema=findMinMax(segment),min=convert(extrema.min,bits),max=convert(extrema.max,bits),peaks[2*i]=min,peaks[2*i+1]=max;return peaks}function makeMono(channelPeaks,bits){var numChan=channelPeaks.length,weight=1/numChan,numPeaks=channelPeaks[0].length/2,c=0,i=0,min,max,peaks=new(eval("Int"+bits+"Array"))(2*numPeaks);for(i=0;numPeaks>i;i++){for(min=0,max=0,c=0;numChan>c;c++)min+=weight*channelPeaks[c][2*i],max+=weight*channelPeaks[c][2*i+1];peaks[2*i]=min,peaks[2*i+1]=max}return[peaks]}module.exports=function(e,n,a,t,r,i){if(n=n||1e4,i=i||8,a=a||!0,[8,16,32].indexOf(i)<0)throw new Error("Invalid number of bits specified for peaks.");var s,m,h,l,o=e.numberOfChannels,u=[];if("undefined"==typeof e.subarray)for(s=0;o>s;s++)h=e.getChannelData(s),t=t||0,r=r||h.length,l=h.subarray(t,r),u.push(extractPeaks(l,n,i));else t=t||0,r=r||e.length,u.push(extractPeaks(e.subarray(t,r),n,i));return a&&u.length>1&&(u=makeMono(u,i)),m=u[0].length/2,{length:m,data:u,bits:i}}}]);