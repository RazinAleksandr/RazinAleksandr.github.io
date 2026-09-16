/**
 * Publications, newest first.
 *
 * `authors` is split so the component can bold me without string matching.
 * Every link here was checked against the live source — don't add one you
 * haven't opened.
 */

export type Publication = {
  title: string;
  authors: { name: string; me?: boolean }[];
  venue: string;
  year: string;
  /** Short badges. `tone` maps to a ColorChecker patch. */
  badges: { label: string; tone: string }[];
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
    badges: [
      { label: "ECCV 2026", tone: "red" },
      { label: "#1 HF Daily", tone: "oryel" },
      { label: "first author", tone: "green" },
    ],
    abstract:
      "Diffusion models pay for high resolution twice: once denoising at scale, and again when post-hoc super-resolution adds artifacts after decoding. LUA upscales the generator's latent before the single VAE decode instead — a drop-in module needing no change to the base model and no extra diffusion stages. 2× faster at 2K and over 20× at 4K, transferable across SDXL, SD3 and FLUX.",
    image: "/pubs/lua.jpg",
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
    badges: [{ label: "Journal", tone: "cyan" }],
    abstract:
      "Fine-tuning pretrained language models on structured, diverse online forum data to improve question answering in the programming domain.",
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
    badges: [
      { label: "MDPI 7(6), 75", tone: "magenta" },
      { label: "27 citations", tone: "green" },
    ],
    abstract:
      "A crawling robot for surveying pipelines and metal structures of complex spatial configuration at oil and gas facilities, with on-device perception replacing manual inspection.",
    links: [
      { label: "DOI", href: "https://doi.org/10.3390/infrastructures7060075" },
      { label: "MDPI", href: "https://www.mdpi.com/2412-3811/7/6/75" },
    ],
  },
];
