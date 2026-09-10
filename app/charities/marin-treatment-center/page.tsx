import CharityResearchReport, {type CharityReportContent} from '@/components/CharityResearchReport';
import report from '@/data/bay/marin-treatment-report.json';

export const metadata = {
  title: 'Marin Treatment Center — GiveBetter research',
  description: 'Conditional ordinary-gift analysis of opioid treatment access, finite survival, uncertain Bay Area attribution and unverified marginal funding room.',
};

export default function Page() {
  const content: CharityReportContent = {
    ...report,
    nutshell: {
      ...report.nutshell,
      body: <>{report.nutshell.body} <a href="/api/marin-treatment-model">Inspect the model, assumptions and scenarios</a>.</>,
    },
  };
  return <CharityResearchReport content={content}/>;
}
