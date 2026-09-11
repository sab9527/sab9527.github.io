global.window = {};
require('D:/WEB TEST/js/rules.js'); require('D:/WEB TEST/js/planner.js');
const P = global.window.RECOMB_PLANNER;
const mod = (a) => ({ name: a[0], kind: a[1] || 'normal' });
const mk = (baseMode, ps, ss) => ({ baseMode, prefixes: ps.map(mod), suffixes: ss.map(mod) });
const show = (title, r) => {
  console.log('='.repeat(8), title);
  if (!r.feasibility.ok) { console.log('不可行：', r.feasibility.issues.join(' / ')); return; }
  if (r.singleAffix) { console.log('單詞綴目標，不需重組。素材：', r.leaves.map(l=>`${l.side} ${l.name}`).join(', ')); return; }
  console.log('【一次合成（最後一步直接做）】');
  r.singleStep.forEach(o=>console.log(`  ${(o.probability*100).toFixed(1)}%｜${o.a.text} ({${o.a.counts}})  +  ${o.b.text} ({${o.b.counts}}) ｜這兩件素材預估要 ${o.prepare.toFixed(0)} 個單詞綴素材`));
  r.routes.forEach((rt,i)=>{
    console.log(`【路線 ${i+1}】${rt.stepCount} 步｜總成功率 ${(rt.probability*100).toFixed(3)}%｜預估單詞綴素材 ${rt.leaves.toFixed(1)} 個｜預估重組 ${rt.attempts.toFixed(1)} 次`);
    rt.steps.forEach((s,k)=>console.log(`   第 ${k+1} 步：${s.a.text} + ${s.b.text} → ${s.result.text}｜${(s.probability*100).toFixed(1)}%`));
    console.log('   需要準備的單詞綴素材：', rt.leaves_.map(l=>`${l.side} ${l.name}×${l.count}`).join('、'));
  });
  console.log();
};
show('目標：3 前綴 3 後綴（同基底）', P.plan(mk('same',[['生命'],['護甲'],['閃避']],[['火抗'],['冰抗'],['雷抗']])));
show('目標：2 前綴 2 後綴（同基底）', P.plan(mk('same',[['生命'],['護甲']],[['火抗'],['冰抗']])));
show('目標：3 前綴 2 後綴（5 詞）', P.plan(mk('same',[['生命'],['護甲'],['閃避']],[['火抗'],['冰抗']])));
show('目標：3 前綴 3 後綴（兩件不同基底）', P.plan(mk('A',[['生命'],['護甲'],['閃避']],[['火抗'],['冰抗'],['雷抗']])));
show('目標：1 前綴 1 後綴（含限定詞）', P.plan(mk('same',[['生命','exclusive']],[['火抗']])));
show('目標：3 前綴 3 後綴（2 條限定詞 → 不可行）', P.plan(mk('same',[['生命','exclusive'],['護甲','exclusive'],['閃避']],[['火抗'],['冰抗'],['雷抗']])));
