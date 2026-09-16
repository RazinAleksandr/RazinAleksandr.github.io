/**
 * Publications, newest first.
 *
 * `authors` is split so the component can mark me without string matching.
 * `image` is relative to public/ and gets the site's base path at render
 * time, so it works at the domain root and under /next/ alike.
 * Every link here was checked against the live source.
 */

export type Publication = {
  title: string;
  authors: { name: string; me?: boolean }[];
  venue: string;
  year: string;
  /** Short note after the venue, e.g. an award. */
  note?: string;
  abstract: string;
  image?: string;
  links: { label: string; href: string }[];
  bibtex?: string;
};

export const publications: Publication[] = [
  {
    title:
      "One Small Step in Latent, One Giant Leap for Pixels: Fast Latent Upscale Adapter for Your Diffusion Models",
    authors: [
      { name: "Aleksandr Razin", me: true },
      { name: "Danil Kazantsev" },
      { name: "Ilya Makarov" },
    ],
    venue: "ECCV",
    year: "2026",
    note: "#1 Hugging Face Daily Paper",
    abstract:
      "Diffusion models pay for resolution twice: denoising at scale, then post-hoc super-resolution that adds artifacts after decoding. LUA upscales the latent before the single VAE decode instead — a drop-in module with no change to the base model and no extra diffusion stage. 2× faster at 2K and over 20× at 4K, transferable across SDXL, SD3 and FLUX.",
    image: "pubs/lua.jpg",
    links: [
      { label: "arXiv", href: "https://arxiv.org/abs/2511.10629" },
      { label: "Project page", href: "https://razinaleksandr.github.io/latent-upscaling-adapter/" },
      { label: "Code", href: "https://github.com/vaskers5/LUA" },
      { label: "Hugging Face", href: "https://huggingface.co/papers/2511.10629" },
    ],
    bibtex: `@inproceedings{razin2026lua,
  title     = {One Small Step in Latent, One Giant Leap for Pixels:
               Fast Latent Upscale Adapter for Your Diffusion Models},
  author    = {Razin, Aleksandr and Kazantsev, Danil and Makarov, Ilya},
  booktitle = {European Conference on Computer Vision (ECCV)},
  year      = {2026},
  eprint    = {2511.10629},
  archivePrefix = {arXiv},
  primaryClass  = {cs.CV}
}`,
  },
  {
    title:
      "Improving question answering in programming domain with pretrained language model fine-tuning using structured diverse online forum data",
    authors: [
      { name: "Alexey Gorbatovski" },
      { name: "Aleksandr Razin", me: true },
      { name: "Auezh Aliev" },
      { name: "Sergey Kovalchuk" },
    ],
    venue: "Journal of ITMO",
    year: "2024",
    abstract:
      "Fine-tuning pretrained language models on structured, diverse online forum data to improve question answering in the programming domain.",
    image: "pubs/qa-model.jpg",
    links: [],
  },
  {
    title:
      "Robot Crawler for Surveying Pipelines and Metal Structures of Complex Spatial Configuration",
    authors: [
      { name: "Vladimir Pshenin" },
      { name: "Anastasia Liagova" },
      { name: "Aleksandr Razin", me: true },
      { name: "Alexander Skorobogatov" },
      { name: "Maxim Komarovsky" },
    ],
    venue: "Infrastructures",
    year: "2022",
    note: "MDPI 7(6), 75",
    abstract:
      "A crawling robot for surveying pipelines and metal structures of complex spatial configuration at oil and gas facilities, with on-device perception replacing manual inspection.",
    image: "pubs/robot-crawler.jpg",
    links: [
      { label: "DOI", href: "https://doi.org/10.3390/infrastructures7060075" },
      { label: "MDPI", href: "https://www.mdpi.com/2412-3811/7/6/75" },
    ],
  },
];
