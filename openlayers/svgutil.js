import "./path-data-polyfill.js";
import { round_to_dec, loader, norm, interp, setAttrs, createSVGElement, fsqrt } from 'sac-utilities';

const build = (symbols, autoscale=1.0) => {
    const result_svgs = [], names = [], staging = document.createElement('div');
    document.body.appendChild(staging);

    symbols.forEach((s) => {
        staging.innerHTML += s.data;
        names.push(s.url.split('/').pop().replace(/\.[^/.]+$/, ""));
    });

    let svg_index = 0;
    staging.childNodes.forEach((c,i) => {
        // console.log(c);
        if(c.nodeName === 'svg'){
            const dims = [parseInt(c.getAttribute('width')), parseInt(c.getAttribute('height'))];
            const g_copy = createSVGElement('symbol', {
                id:`${names[svg_index]}-symbol`,
                viewBox:`0 0 ${dims[0]} ${dims[1]}`,
            });

            // const g_copy = createSVGElement('g', {
            //     transform:`translate(128,128)`
            // });
            // console.log(g_copy);
            
            c.childNodes.forEach((cc,i) => {
                if(cc.nodeName.indexOf('#') === -1){
                    const pd = cc.getPathData({normalize:true});
                    // pd.forEach((k) => {
                    //     k.values = k.values.map((v,i) => i%2 === 0 ? round_to_dec(Number(v) - (dims[0]/2),3) : round_to_dec(Number(v) - (dims[1]/2),3));
                    // })
                    const _path = createSVGElement('path',{});
                    _path.setPathData(pd);
                    const style = cc.getAttribute('style');
                    style && setAttrs(_path,{style:style});
                    // setAttrs(_path,{transform:`scale(0.1,0.1)`});
                    g_copy.appendChild(_path);
                }
            });

            // g_symbol.appendChild(g_copy);
            result_svgs.push(g_copy);
            svg_index ++;
        }
    });
    staging.remove();
    return result_svgs;
}

export const import_svg = async (urls) => {
    return loader(urls.map((u) => {return {url:u}})).then((dat) => build(dat)).then((res) => (res));
}
