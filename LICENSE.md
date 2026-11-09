# Licensing and Attribution

This project incorporates 3D models and anatomical data derived from **Z-Anatomy** and is distributed in compliance with the **Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0)**.

---

## 1. Attribution Notice

### Primary 3D Anatomy Source
- **Title:** Z-Anatomy — Models of human anatomy
- **Authors & Contributors:** Gauthier Kervyn (design, 3D modelling, anatomy), Marcin Zielinski (scripts & tooling), and the [Z-Anatomy community](https://www.z-anatomy.com/)
- **Source Repository:** [https://github.com/Z-Anatomy/Models-of-human-anatomy](https://github.com/Z-Anatomy/Models-of-human-anatomy)
- **License:** [Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)](https://creativecommons.org/licenses/by-sa/4.0/)

### Upstream and Associated Sources
- **BodyParts3D:**
  - Copyright: © The Database Center for Life Science (DBCLS), Japan. Original model created by Kousaku Okubo.
  - License: [CC BY-SA 2.1 Japan](https://creativecommons.org/licenses/by-sa/2.1/jp/)
  - URL: [https://dbarchive.biosciencedbc.jp/en/bodyparts3d/](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/)
- **Wikipedia Contributors:**
  - Anatomical definitions, structural notes, and Latin nomenclature adapted from Wikipedia articles.
  - License: [CC BY-SA 3.0 / 4.0](https://creativecommons.org/licenses/by-sa/4.0/)
- **OpenStax — Anatomy and Physiology 2e:**
  - Peer-reviewed textbook referenced for curriculum cross-verification and structural fact-checking.
  - License: [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)
  - URL: [https://openstax.org/details/books/anatomy-and-physiology-2e](https://openstax.org/details/books/anatomy-and-physiology-2e)

---

## 2. Notice of Modifications (CC BY-SA 4.0 Section 3(a))

In accordance with Section 3(a)(1)(B) of the CC BY-SA 4.0 license, the following modifications were made to the original Z-Anatomy Blender models:

1. **Curriculum Selection & Filtering:** Extracted subsets of skeletal landmarks, bones, superficial/deep muscles, and joint capsules relevant to artistic anatomy training (excluding internal viscera, neurovascular bundles, and micro-structures).
2. **Mesh Decimation & Optimization:** Decimated mesh topologies to meet real-time web performance budgets (≤ 25,000 triangles per individual mesh, ≤ 80,000 triangles per regional bundle) without sacrificing anatomical landmarks.
3. **Format Conversion:** Converted models from Blender `.blend` files to Draco-less binary glTF (`.glb`) files mapped via JSON manifests.
4. **Coordinate & Scale Normalization:** Transformed, re-centered, and normalized object origins for WebGL Three.js viewport rendering.
5. **Split-Plane Écorché Bisection:** Bisected the full-body model along the sagittal plane (+X right side for peelable study muscles, −X left side for skeletal reference).

---

## 3. Share-Alike Terms (CC BY-SA 4.0 Section 3(b))

Under the ShareAlike condition of **CC BY-SA 4.0**:
- If you remix, transform, or build upon the 3D models, mesh manifests, or derived anatomical content in this project, you must distribute your contributions under the **same license (CC BY-SA 4.0)**.
- You must retain all attribution notices, provide a link to the license, and indicate any further modifications made.
- Application code that is not an adaptation of the anatomical database is provided under the same open terms to ensure compatibility across the entire repository.

---

## 4. Creative Commons Attribution-ShareAlike 4.0 International (Summary)

You are free to:
- **Share** — copy and redistribute the material in any medium or format.
- **Adapt** — remix, transform, and build upon the material for any purpose, even commercially.

Under the following terms:
- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made. You may do so in any reasonable manner, but not in any way that suggests the licensor endorses you or your use.
- **ShareAlike** — If you remix, transform, or build upon the material, you must distribute your contributions under the same license as the original.
- **No additional restrictions** — You may not apply legal terms or technological measures that legally restrict others from doing anything the license permits.

For the full legal text of the license, visit:
[https://creativecommons.org/licenses/by-sa/4.0/legalcode](https://creativecommons.org/licenses/by-sa/4.0/legalcode)
