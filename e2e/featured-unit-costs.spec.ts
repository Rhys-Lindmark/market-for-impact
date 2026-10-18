import {test,expect} from '@playwright/test';
import selection from '../data/edition-featured.json' with {type:'json'};
import reports from '../data/geography-reports.json' with {type:'json'};
import {nativeUnitForReport,nativeUnitForSF} from '../lib/featured-unit-costs.mjs';
import {formatImpactPrice} from '../lib/impact-metric.mjs';
import {reportPrice} from '../lib/geography-reports.mjs';

const sf=['recares','self-help-for-the-elderly','hope-pacifica','project-homeless-connect'];
const expected:Record<string,ReturnType<typeof nativeUnitForSF>[]>={'san-francisco':sf.map(nativeUnitForSF)};
for(const [edition,entry]of Object.entries(selection.editions))expected[edition]=entry.slugs.map(slug=>nativeUnitForReport(reports.reports.find(r=>r.edition===edition&&r.slug===slug)));
for(const [edition,estimates]of Object.entries(expected)){
  test(`${edition} displays concrete unit costs without changing DALYs or reintroducing captions`,async({page})=>{
    await page.goto('/'+edition);
    const cards=page.locator('.sf-home-charity');
    await expect(cards).toHaveCount(4);
    await expect(cards.locator('figcaption')).toHaveCount(0);
    for(let i=0;i<estimates.length;i++){
      const estimate=estimates[i],card=cards.nth(i),unit=card.locator('[data-native-unit]');
      if(estimate.priceUSD===null){await expect(unit).toHaveCount(0);await expect(card).toContainText('per DALY');continue;}
      await expect(unit).toHaveText(estimate.line+(estimate.line.endsWith('.')?'':'.'));
      await expect(unit).toHaveAttribute('data-native-price',String(estimate.priceUSD));
      const cost=card.locator('[data-cost-effectiveness]');
      await expect(cost.locator('details, summary')).toHaveCount(0);
      await expect(cost).not.toContainText(estimate.basis);
      await expect(cost.getByRole('link',{name:'Service-cost source and assumptions'})).toHaveAttribute('href',/^https:\/\/ai\.rhyslindmark\.com\/givebetter\//);
      const bodySize=await card.locator('.sf-home-charity-body section').first().locator('p').evaluate(el=>getComputedStyle(el).fontSize);
      expect(await cost.evaluate(el=>getComputedStyle(el).fontSize)).toBe(bodySize);
      expect(await unit.locator('strong').evaluate(el=>getComputedStyle(el).fontSize)).toBe(bodySize);
      if(edition!=='san-francisco'){
        const report=reports.reports.find(r=>r.edition+'/'+r.slug===estimate.key)!;
        await expect(card.locator('[data-daly-comparison]')).toHaveText('We estimate '+formatImpactPrice(reportPrice(report))+' per DALY.');
      }
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });
}
