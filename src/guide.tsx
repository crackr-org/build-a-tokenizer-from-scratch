import type { ComponentType } from "react";
import { BenchmarkBpePage } from "./content/build-a-bpe-tokenizer/BenchmarkBpeArticlePage";
import { HowBpeCompressesTextPage } from "./content/build-a-bpe-tokenizer/HowBpeCompressesTextArticlePage";
import { ImplementBpePage } from "./content/build-a-bpe-tokenizer/ImplementBpeArticlePage";
import { UnicodeUtf8AndBytesPage } from "./content/build-a-bpe-tokenizer/UnicodeUtf8AndBytesArticlePage";
import { BuildPairHeapPage } from "./content/make-bpe-training-fast/BuildPairHeapArticlePage";
import { BuildPairIndexPage } from "./content/make-bpe-training-fast/BuildPairIndexArticlePage";
import { ParallelPretokenizationPage } from "./content/make-bpe-training-fast/ParallelPretokenizationArticlePage";
import { UpdatePairCountsPage } from "./content/make-bpe-training-fast/UpdatePairCountsArticlePage";
import { BuildTokenizerPlaygroundPage } from "./content/ship-your-tokenizer/BuildTokenizerPlaygroundArticlePage";
import { PortToTiktokenPage } from "./content/ship-your-tokenizer/PortToTiktokenArticlePage";
import { ScaleUpTrainingPage } from "./content/ship-your-tokenizer/ScaleUpTrainingArticlePage";
import { WhereToGoFromHerePage } from "./content/ship-your-tokenizer/WhereToGoFromHereArticlePage";
import { BuildCoreTokenizerPage } from "./content/text-to-utf8-bytes/BuildCoreTokenizerPage";
import { HandleSpecialTokensPage } from "./content/text-to-utf8-bytes/HandleSpecialTokensPage";
import { WhyLlmsNeedTokenizationPage } from "./content/text-to-utf8-bytes/WhyLlmsNeedTokenizationPage";
import { ProjectSetupPage } from "./pages/ProjectSetupPage";

export type GuideLesson = {
  slug: string;
  title: string;
  minutes: number;
  evaluated?: boolean;
  component: ComponentType<{ estimatedMinutes: number }>;
};

export type GuideStage = {
  title: string;
  lessons: GuideLesson[];
};

export const GUIDE_STAGES: GuideStage[] = [
  {
    title: "Project setup",
    lessons: [
      {
        slug: "project-setup",
        title: "Prepare your workspace",
        minutes: 3,
        component: ProjectSetupPage,
      },
    ],
  },
  {
    title: "Build a simple tokenizer",
    lessons: [
      {
        slug: "llms-cant-read",
        title: "LLMs can’t read",
        minutes: 15,
        component: WhyLlmsNeedTokenizationPage,
      },
      {
        slug: "build-core-tokenizer",
        title: "Build the core tokenizer",
        minutes: 45,
        evaluated: true,
        component: BuildCoreTokenizerPage,
      },
      {
        slug: "handle-special-tokens",
        title: "Handle special tokens",
        minutes: 15,
        evaluated: true,
        component: HandleSpecialTokensPage,
      },
    ],
  },
  {
    title: "Build a BPE tokenizer",
    lessons: [
      {
        slug: "unicode-utf8-and-bytes",
        title: "Unicode, UTF-8, and bytes",
        minutes: 45,
        component: UnicodeUtf8AndBytesPage,
      },
      {
        slug: "how-bpe-compresses-text",
        title: "How BPE compresses text",
        minutes: 45,
        component: HowBpeCompressesTextPage,
      },
      {
        slug: "implement-bpe",
        title: "Implement BPE",
        minutes: 60,
        evaluated: true,
        component: ImplementBpePage,
      },
      {
        slug: "benchmark-your-bpe",
        title: "Benchmark your BPE implementation",
        minutes: 15,
        component: BenchmarkBpePage,
      },
    ],
  },
  {
    title: "Make BPE training fast",
    lessons: [
      {
        slug: "update-pair-counts",
        title: "Update pair counts",
        minutes: 45,
        component: UpdatePairCountsPage,
      },
      {
        slug: "pretokenize-in-parallel",
        title: "Pretokenize in parallel",
        minutes: 45,
        component: ParallelPretokenizationPage,
      },
      {
        slug: "build-a-pair-index",
        title: "Build a pair index",
        minutes: 60,
        component: BuildPairIndexPage,
      },
      {
        slug: "build-a-pair-heap",
        title: "Build a pair heap",
        minutes: 60,
        component: BuildPairHeapPage,
      },
    ],
  },
  {
    title: "Ship your tokenizer",
    lessons: [
      {
        slug: "scale-up-training",
        title: "Scale up training",
        minutes: 10,
        component: ScaleUpTrainingPage,
      },
      {
        slug: "port-your-tokenizer",
        title: "Port your tokenizer",
        minutes: 35,
        evaluated: true,
        component: PortToTiktokenPage,
      },
      {
        slug: "build-a-tokenizer-playground",
        title: "Build a tokenizer playground",
        minutes: 15,
        component: BuildTokenizerPlaygroundPage,
      },
      {
        slug: "where-to-go-from-here",
        title: "Where to go from here",
        minutes: 10,
        component: WhereToGoFromHerePage,
      },
    ],
  },
];

export const GUIDE_LESSONS = GUIDE_STAGES.flatMap((stage) => stage.lessons);

export function findLesson(slug: string | undefined) {
  return GUIDE_LESSONS.find((lesson) => lesson.slug === slug);
}
