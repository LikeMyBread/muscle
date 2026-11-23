import * as THREE from 'three';

export type KinematicSegment =
  | 'pelvis'
  | 'spine'
  | 'arm'
  | 'forearm'
  | 'hand'
  | 'thigh'
  | 'shin'
  | 'foot'
  | 'bridging';

/**
 * Calibrated anatomical joint pivot coordinates in local rest space (before layout transform).
 * Calibrated against Z-Anatomy bone endpoints and joint capsule centers.
 */
export const KINEMATIC_PIVOTS = {
  spine: new THREE.Vector3(0.0, 1.05, -0.05),
  shoulder: new THREE.Vector3(0.163, 1.378, -0.028),
  elbow: new THREE.Vector3(0.22, 1.107, -0.037),
  wrist: new THREE.Vector3(0.265, 0.852, 0.022),
  hip: new THREE.Vector3(0.09, 0.885, -0.007),
  knee: new THREE.Vector3(0.095, 0.435, -0.026),
  ankle: new THREE.Vector3(0.08, 0.075, -0.029),
} as const;

/**
 * Assigns an anatomy node to its corresponding rigid skeletal kinematic segment.
 */
export function getKinematicSegmentForNodeId(
  nodeId: string,
  nodeRegion?: string,
  nodeName?: string,
): KinematicSegment {
  const text = (nodeId + ' ' + (nodeName || '')).toLowerCase();

  // 0. Bridging dual-anchored muscles (e.g. Psoas major spanning lumbar spine and femur, Plantaris spanning femur and shin)
  if (
    nodeId === 'atlas_psoas_muscle_r_08af9941' ||
    text === 'psoas muscle.r' ||
    text.includes('psoas_muscle') ||
    text.includes('psoas muscle')
  ) {
    return 'bridging';
  }

  const isPlantarisOrigin =
    nodeId === 'atlas_plantaris_muscle_medially_to_the_lat_143de19a' ||
    nodeId === 'atlas_plantaris_muscle_medially_to_the_lat_3ef61b75' ||
    text.includes('origin') ||
    text.includes('orig') ||
    text.includes('medially_to_the_lat');

  if (
    nodeId === 'atlas_plantaris_muscle_r_5a2fd02c' ||
    text === 'plantaris muscle.r' ||
    text.includes('plantaris_muscle_r') ||
    (text.includes('plantaris') && !isPlantarisOrigin)
  ) {
    return 'bridging';
  }

  if (
    nodeId === 'atlas_transversus_abdominis_muscle_r_c20d1664' ||
    text === 'transversus abdominis muscle.r' ||
    text.includes('transversus_abdominis') ||
    text.includes('transversus abdominis')
  ) {
    return 'bridging';
  }

  if (
    nodeId === 'atlas_fascia_lata_r_d92bb3d0' ||
    text === 'fascia lata.r' ||
    text.includes('fascia_lata') ||
    text.includes('fascia lata')
  ) {
    return 'bridging';
  }

  const isBrachioradialisInsertion =
    nodeId === 'atlas_bracioradialis_muscle_humeral_insert_03bc4dad' ||
    text.includes('humeral_insert') ||
    text.includes('humeral insertion');

  if (
    !isBrachioradialisInsertion &&
    (nodeId === 'muscle_brachioradialis' ||
      text === 'brachioradialis' ||
      text.includes('brachioradialis') ||
      text.includes('bracioradialis'))
  ) {
    return 'bridging';
  }

  const isBicepsRadialInsertion =
    nodeId === 'atlas_biceps_brachii_muscle_radial_inserti_5a9942a5' ||
    text.includes('radial_insert') ||
    text.includes('radial insertion');

  if (
    !isBicepsRadialInsertion &&
    (nodeId === 'muscle_biceps_brachii' ||
      text === 'biceps brachii' ||
      text.includes('biceps_brachii') ||
      (text.includes('biceps') && text.includes('brachii')))
  ) {
    return 'bridging';
  }

  const isQuadOriginOrInsertion =
    nodeId === 'atlas_quadriceps_femoris_on_base_of_patell_0a32a9b6' ||
    nodeId.startsWith('atlas_origin_of_vastus') ||
    text.includes('origin_of_vastus') ||
    text.includes('on_base_of_patell') ||
    text.includes('patell');

  if (
    !isQuadOriginOrInsertion &&
    (nodeId === 'muscle_quadriceps_rectus_femoris' ||
      nodeId === 'muscle_vastus_lateralis' ||
      nodeId === 'muscle_vastus_medialis' ||
      nodeId === 'muscle_vastus_intermedius' ||
      text.includes('rectus_femoris') ||
      text.includes('rectus femoris') ||
      text.includes('vastus') ||
      text.includes('quadriceps'))
  ) {
    return 'bridging';
  }

  const isSartoriusOriginOrInsertion =
    nodeId === 'atlas_sartorius_muscle_on_upper_anterior_i_a4219826' ||
    nodeId === 'atlas_sartorius_on_patte_d_oie_r_114b15fb' ||
    text.includes('patte') ||
    text.includes('anterior_i') ||
    text.includes('iliac');

  if (
    !isSartoriusOriginOrInsertion &&
    (nodeId === 'muscle_sartorius' ||
      text === 'sartorius' ||
      text.includes('sartorius'))
  ) {
    return 'bridging';
  }

  const isHamstringOriginOrInsertion =
    nodeId === 'atlas_long_head_of_biceps_femoris_muscle_i_69d2859a' ||
    nodeId === 'atlas_long_head_of_biceps_femoris_on_fibul_ed8ca122' ||
    text.includes('ischiat') ||
    text.includes('fibul') ||
    text.includes('patte');

  if (
    !isHamstringOriginOrInsertion &&
    (nodeId === 'muscle_hamstrings_biceps_femoris' ||
      nodeId === 'muscle_semitendinosus' ||
      nodeId === 'muscle_semimembranosus' ||
      text.includes('hamstring') ||
      text.includes('semitendinosus') ||
      text.includes('semimembranosus') ||
      (text.includes('biceps') && text.includes('femoris')))
  ) {
    return 'bridging';
  }

  const isGracilisOriginOrInsertion =
    nodeId === 'atlas_gracilis_muscle_pubic_insertion_r_3568d7dc' ||
    nodeId === 'atlas_gracilis_on_patte_d_oie_r_c1543752' ||
    text.includes('pubic') ||
    text.includes('patte');

  if (
    !isGracilisOriginOrInsertion &&
    (nodeId === 'muscle_gracilis' ||
      text === 'gracilis' ||
      text.includes('gracilis'))
  ) {
    return 'bridging';
  }

  // Extensor carpi radialis longus (spans lateral distal humerus across elbow to forearm / metacarpals)
  if (
    nodeId === 'muscle_extensor_carpi_radialis' ||
    text === 'extensor carpi radialis longus' ||
    text.includes('extensor_carpi_radialis_longus') ||
    text.includes('extensor carpi radialis longus') ||
    (text.includes('extensor_carpi_radialis') && !text.includes('brevis'))
  ) {
    return 'bridging';
  }

  // Brachialis (spans anterior lower humerus across elbow to coronoid process of ulna)
  const isBrachialisInsertOrOrigin =
    nodeId === 'atlas_brachialis_anterior_muscle_humeral_i_5bacb069' ||
    nodeId === 'atlas_brachialis_muscle_ulnar_insertion_r_ee7c1b98' ||
    text.includes('coracobrachialis') ||
    text.includes('humeral_i') ||
    text.includes('ulnar_insert');

  if (
    !isBrachialisInsertOrOrigin &&
    (nodeId === 'muscle_brachialis' ||
      text === 'brachialis' ||
      (text.includes('brachialis') && !text.includes('coracobrachialis')))
  ) {
    return 'bridging';
  }

  // Gastrocnemius (lateral and medial heads span posterior femoral condyles across knee to calcaneus)
  const isGastrocnemiusOrigin =
    nodeId.startsWith('atlas_lateral_head_of_gastrocnemius') ||
    nodeId.startsWith('atlas_medial_head_of_gastrocnemius') ||
    text.includes('head of gastrocnemius on') ||
    text.includes('gastrocnemius_on_lat') ||
    text.includes('gastrocnemius_on_med');

  if (
    !isGastrocnemiusOrigin &&
    !text.includes('plantaris') &&
    (nodeId === 'muscle_gastrocnemius' ||
      text === 'gastrocnemius' ||
      text.includes('gastrocnemius'))
  ) {
    return 'bridging';
  }

  // Deltoid group (Anterior, Lateral, Posterior heads span shoulder girdle / spine to humerus)
  const isDeltoidHumeralInsertion =
    nodeId === 'atlas_deltoid_muscle_humeral_insertion_r_ed353102' ||
    text.includes('deltoid_muscle_humeral') ||
    text.includes('deltoid muscle-humeral insertion');

  const isDeltoidScapularOrClavicularOrigin =
    nodeId === 'atlas_acromial_head_of_deltoid_muscle_scap_18d4e450' ||
    nodeId === 'atlas_clavicular_part_of_deltoid_muscle_cl_5b15cb2b' ||
    nodeId === 'atlas_scapular_head_of_deltoid_muscle_scap_708240d7' ||
    text.includes('acromial_head_of_deltoid') ||
    text.includes('clavicular_part_of_deltoid') ||
    text.includes('scapular_head_of_deltoid') ||
    text.includes('deltoid muscle-scapular insertion') ||
    text.includes('deltoid muscle-clavicular insertion');

  if (
    !isDeltoidHumeralInsertion &&
    !isDeltoidScapularOrClavicularOrigin &&
    (nodeId === 'muscle_deltoid_anterior' ||
      nodeId === 'muscle_deltoid_lateral' ||
      nodeId === 'muscle_deltoid_posterior' ||
      text.includes('deltoid'))
  ) {
    return 'bridging';
  }

  // Pectoralis major (Spans sternum, ribs, and clavicle across shoulder to humerus)
  const isPectoralisHumeralInsertion =
    nodeId === 'atlas_pectoralis_major_muscle_humeral_inse_782e067b' ||
    text.includes('pectoralis_major_muscle_humeral') ||
    text.includes('pectoralis major muscle-humeral insertion');

  const isPectoralisClavicularOrigin =
    nodeId === 'atlas_pectoralis_major_muscle_clavicular_i_25190cac' ||
    text.includes('pectoralis_major_muscle_clavicular') ||
    text.includes('pectoralis major muscle-clavicular insertion');

  if (
    !isPectoralisHumeralInsertion &&
    !isPectoralisClavicularOrigin &&
    !text.includes('minor') &&
    (nodeId === 'muscle_pectoralis_major' ||
      text === 'pectoralis major' ||
      text.includes('pectoralis_major') ||
      text.includes('pectoralis major') ||
      (text.includes('pectoralis') && !text.includes('minor')))
  ) {
    return 'bridging';
  }

  // Latissimus dorsi (Spans thoracic/lumbar spine, ribs, and pelvis to humerus bicipital groove)
  const isLatissimusHumeralInsertion =
    text.includes('latissimus_dorsi_humeral') ||
    text.includes('latissimus dorsi humeral') ||
    text.includes('latissimus dorsi muscle-humeral');

  const isLatissimusTorsoOrigin =
    nodeId === 'atlas_latissimus_dorsi_iliac_insertion_r_fbd5c83d' ||
    nodeId === 'atlas_latissimus_dorsi_on_apex_of_the_scap_83328ed8' ||
    text.includes('latissimus_dorsi_iliac') ||
    text.includes('latissimus_dorsi_on_apex') ||
    text.includes('latissimus dorsi-iliac') ||
    text.includes('latissimus dorsi on apex');

  if (
    !isLatissimusHumeralInsertion &&
    !isLatissimusTorsoOrigin &&
    (nodeId === 'muscle_latissimus_dorsi' ||
      text === 'latissimus dorsi' ||
      text.includes('latissimus_dorsi') ||
      text.includes('latissimus dorsi') ||
      text.includes('latissimus'))
  ) {
    return 'bridging';
  }

  // Teres major (Spans inferior angle of scapula to humerus medial lip of intertubercular groove)
  const isTeresMajorHumeralInsertion =
    nodeId === 'atlas_teres_major_muscle_humeral_insertion_c559f237' ||
    text.includes('teres_major_muscle_humeral') ||
    text.includes('teres major muscle-humeral insertion');

  const isTeresMajorScapularOrigin =
    nodeId === 'atlas_teres_major_muscle_scapular_insertio_798d71da' ||
    text.includes('teres_major_muscle_scapular') ||
    text.includes('teres major muscle-scapular insertion');

  if (
    !isTeresMajorHumeralInsertion &&
    !isTeresMajorScapularOrigin &&
    !text.includes('minor') &&
    !text.includes('pronator') &&
    (nodeId === 'muscle_teres_major' ||
      text === 'teres major' ||
      text.includes('teres_major') ||
      text.includes('teres major'))
  ) {
    return 'bridging';
  }

  // Erector spinae group (spans posterior pelvis/sacrum to thoracic spine and ribs)
  const isErectorSpinaeIliacInsertion =
    nodeId === 'atlas_erector_spinae_muscles_iliac_inserti_bfc50f21' ||
    text.includes('erector_spinae_muscles_iliac') ||
    text.includes('erector spinae muscles-iliac');

  if (
    !isErectorSpinaeIliacInsertion &&
    (nodeId === 'muscle_erector_spinae' ||
      text === 'erector spinae' ||
      text === 'erector spinae.r' ||
      text === 'erector spinae.l' ||
      text.includes('muscle_erector_spinae') ||
      nodeId === 'atlas_longissimus_thoracis_r_9a6c4246' ||
      text.includes('longissimus_thoracis') ||
      text.includes('longissimus thoracis') ||
      text.includes('iliocostalis_lumborum') ||
      text.includes('iliocostalis lumborum') ||
      text.includes('sacrospinalis') ||
      (text.includes('erector') && text.includes('spinae')))
  ) {
    return 'bridging';
  }

  // External oblique (spans iliac crest / inguinal ligament to lower ribs)
  const isExternalObliqueIliacInsertion =
    nodeId === 'atlas_external_abdominal_oblique_muscle_il_ef830ec5' ||
    text.includes('external_abdominal_oblique_muscle_il') ||
    text.includes('external abdominal oblique muscle-iliac');

  if (
    !isExternalObliqueIliacInsertion &&
    (nodeId === 'muscle_external_oblique' ||
      text === 'external oblique' ||
      text === 'external oblique.r' ||
      text === 'external oblique.l' ||
      text.includes('external_oblique') ||
      text.includes('external oblique') ||
      text.includes('external_abdominal_oblique') ||
      text.includes('external abdominal oblique') ||
      text.includes('obliquus_externus') ||
      text.includes('obliquus externus'))
  ) {
    return 'bridging';
  }

  // Internal abdominal oblique (spans iliac crest / inguinal ligament to lower ribs and linea alba)
  const isInternalObliqueIliacInsertion =
    nodeId === 'atlas_internal_abdominal_oblique_muscle_il_45b42876' ||
    text.includes('internal_abdominal_oblique_muscle_il') ||
    text.includes('internal abdominal oblique muscle-iliac');

  if (
    !isInternalObliqueIliacInsertion &&
    (nodeId === 'atlas_internal_abdominal_oblique_r_7656165c' ||
      text === 'internal abdominal oblique.r' ||
      text === 'internal abdominal oblique' ||
      text.includes('internal_abdominal_oblique') ||
      text.includes('internal abdominal oblique') ||
      text.includes('internal_oblique') ||
      text.includes('internal oblique') ||
      text.includes('obliquus_internus') ||
      text.includes('obliquus internus'))
  ) {
    return 'bridging';
  }

  // Linea alba (spans pubic symphysis to xiphoid process along anterior midline)
  if (
    nodeId === 'atlas_linea_alba_eeb055b3' ||
    text === 'linea alba' ||
    text.includes('linea_alba') ||
    text.includes('linea alba')
  ) {
    return 'bridging';
  }

  // Rectus abdominis (spans pubic crest to cartilages of ribs 5-7 and xiphoid)
  if (
    nodeId === 'muscle_rectus_abdominis' ||
    text === 'rectus abdominis' ||
    text === 'rectus abdominis.r' ||
    text === 'rectus abdominis.l' ||
    text.includes('rectus_abdominis') ||
    text.includes('rectus abdominis')
  ) {
    return 'bridging';
  }

  // Quadratus lumborum (spans iliac crest to 12th rib and lumbar transverse processes)
  if (
    nodeId === 'atlas_quadratus_lumborum_muscle_r_d64800b8' ||
    text === 'quadratus lumborum muscle.r' ||
    text.includes('quadratus_lumborum') ||
    text.includes('quadratus lumborum')
  ) {
    return 'bridging';
  }

  // Lumbar spine vertebrae (L1-L5) and intervertebral discs (L5-S1 through T12-L1)
  // These bridge between the sacrum / hip bone assembly and the thoracic cage,
  // articulating along a smooth continuous spinal curve as the torso moves.
  if (
    nodeId === 'atlas_l5_3a4b083c' ||
    nodeId === 'atlas_l4_08ade9e0' ||
    nodeId === 'atlas_l3_c6cacbbe' ||
    nodeId === 'atlas_l2_a58b12bf' ||
    nodeId === 'atlas_l1_52b1773e' ||
    nodeId === 'atlas_intervertebral_disc_l5_s1_80789ffd' ||
    nodeId === 'atlas_intervertebral_disc_l4_l5_260f550f' ||
    nodeId === 'atlas_intervertebral_disc_l3_l4_bdf9d7c5' ||
    nodeId === 'atlas_intervertebral_disc_l2_l3_ac930073' ||
    nodeId === 'atlas_intervertebral_disc_l1_l2_c10e90aa' ||
    nodeId === 'atlas_intervertebral_disc_t12_l1_5710f59d' ||
    text.includes('intervertebral_disc_l') ||
    text.includes('intervertebral disc l') ||
    text.includes('intervertebral_disc_t12_l1') ||
    text.includes('intervertebral disc t12-l1') ||
    /^atlas_l[1-5](_|$)/.test(nodeId) ||
    text === 'l1' || text === 'l2' || text === 'l3' || text === 'l4' || text === 'l5' ||
    text.includes('vertebra_l') ||
    text.includes('vertebra l') ||
    text.includes('lumbar_vertebra') ||
    text.includes('lumbar vertebra')
  ) {
    return 'bridging';
  }

  // 1. Pelvis (Root of hip assembly, pelvic floor, coccyx, perineum, sphincter & pyramidalis muscles)
  if (
    nodeId === 'bone_pelvis' ||
    nodeId === 'atlas_coccygeus_muscle_r_c7b9df83' ||
    nodeId === 'atlas_iliococcygeus_muscle_r_f5772056' ||
    nodeId === 'atlas_pubococcygeus_muscle_r_a87d3b88' ||
    nodeId === 'atlas_puborectalis_muscle_r_9f43ed9b' ||
    nodeId === 'atlas_external_anal_sphincter_r_91adc941' ||
    nodeId === 'atlas_levator_ani_pubic_and_ischiatic_inse_3ea30fe1' ||
    nodeId === 'atlas_pyramidalis_muscle_r_9e122134' ||
    nodeId === 'atlas_gracilis_muscle_pubic_insertion_r_3568d7dc' ||
    nodeId === 'atlas_long_head_of_biceps_femoris_muscle_i_69d2859a' ||
    nodeId === 'atlas_sartorius_muscle_on_upper_anterior_i_a4219826' ||
    nodeId === 'atlas_obturator_internus_pelvic_insertion_r_1cf32be7' ||
    text.includes('pelvis') ||
    text.includes('pelvic') ||
    text.includes('sacrum') ||
    text.includes('sacral') ||
    text.includes('coccyx') ||
    text.includes('coccyg') || // matches coccygeus, coccygeal, anococcygeal, iliococcygeus, pubococcygeus
    text.includes('puborect') || // matches puborectalis
    text.includes('pubococcyg') ||
    text.includes('iliococcyg') ||
    text.includes('levator_ani') ||
    text.includes('levator ani') ||
    text.includes('anal_sphincter') ||
    text.includes('anal sphincter') ||
    text.includes('sphincter_ani') ||
    text.includes('sphincter ani') ||
    text.includes('external_anal') ||
    text.includes('external anal') ||
    text.includes('internal_anal') ||
    text.includes('internal anal') ||
    text.includes('sphincter_urethrae') ||
    text.includes('sphincter urethrae') ||
    text.includes('perine') ||
    text.includes('ischiocav') ||
    text.includes('bulbosp') ||
    text.includes('pelvic_floor') ||
    text.includes('pelvic floor') ||
    text.includes('pelvic_diaphragm') ||
    text.includes('pelvic diaphragm') ||
    text.includes('pyramidalis') ||
    text.includes('pudend') ||
    text.includes('ilium') ||
    text.includes('ischium') ||
    text.includes('pubis') ||
    text.includes('pubic') ||
    text.includes('ischiat') ||
    text.includes('sacroiliac') ||
    text.includes('iliac') ||
    text.includes('iliac_fossa') ||
    text.includes('iliac fossa')
  ) {
    return 'pelvis';
  }

  // 2. Foot
  const isEyelidTarsus =
    text.includes('superior_tarsus') ||
    text.includes('inferior_tarsus') ||
    text.includes('superior tarsus') ||
    text.includes('inferior tarsus');

  if (
    !isEyelidTarsus &&
    (nodeId === 'bone_calcaneus' ||
      nodeId === 'bone_talus' ||
      nodeId === 'bone_tarsals' ||
      nodeId === 'bone_metatarsals' ||
      nodeId === 'bone_phalanges_foot' ||
      nodeId === 'joint_ankle' ||
      nodeId === 'joint_subtalar' ||
      nodeRegion === 'foot' ||
      text.includes('foot') ||
      text.includes('calcane') ||
      text.includes('talus') ||
      text.includes('tarsal') ||
      text.includes('metatarsal') ||
      (text.includes('plantar') && !text.includes('plantaris')) ||
      text.includes('sesamoid') ||
      text.includes('cuneiform') ||
      text.includes('cuboid') ||
      text.includes('navicular') ||
      text.includes('hallucis_brevis') ||
      text.includes('hallucis brevis') ||
      text.includes('abductor_hallucis') ||
      text.includes('abductor hallucis') ||
      text.includes('adductor_hallucis') ||
      text.includes('adductor hallucis') ||
      text.includes('digiti_minimi_of_foot') ||
      text.includes('digiti minimi of foot') ||
      text.includes('quadratus_plantae') ||
      text.includes('quadratus plantae') ||
      text.includes('extensor_digitorum_brevis') ||
      text.includes('extensor digitorum brevis') ||
      text.includes('flexor_digitorum_brevis') ||
      text.includes('flexor digitorum brevis'))
  ) {
    return 'foot';
  }

  // 3. Shin / Lower leg (Parented to knee pivot)
  if (
    nodeId === 'bone_tibia' ||
    nodeId === 'bone_fibula' ||
    nodeId === 'bone_patella' ||
    nodeId === 'joint_knee' ||
    nodeId === 'atlas_sartorius_on_patte_d_oie_r_114b15fb' ||
    nodeId === 'atlas_gracilis_on_patte_d_oie_r_c1543752' ||
    nodeId === 'atlas_long_head_of_biceps_femoris_on_fibul_ed8ca122' ||
    nodeId === 'atlas_quadriceps_femoris_on_base_of_patell_0a32a9b6' ||
    text.includes('tibia') ||
    text.includes('fibula') ||
    text.includes('fibular') ||
    text.includes('patella') ||
    text.includes('patell') ||
    text.includes('patte') ||
    text.includes('patte_d_oie') ||
    text.includes('pes_anserinus') ||
    text.includes('pes anserinus') ||
    text.includes('interosseus_membrane_of_leg') ||
    text.includes('interosseus membrane of leg') ||
    text.includes('tibialis') ||
    (!isGastrocnemiusOrigin && text.includes('gastrocnemius') && !text.includes('plantaris')) ||
    text.includes('soleus') ||
    text.includes('solear') ||
    text.includes('popliteus') ||
    text.includes('peroneus') ||
    text.includes('fibularis') ||
    text.includes('extensor_digitorum_longus') ||
    text.includes('extensor digitorum longus') ||
    text.includes('flexor_digitorum_longus') ||
    text.includes('flexor digitorum longus') ||
    text.includes('extensor_hallucis_longus') ||
    text.includes('extensor hallucis longus') ||
    text.includes('flexor_hallucis_longus') ||
    text.includes('flexor hallucis longus')
  ) {
    return 'shin';
  }

  // 4. Hand (Parented to wrist pivot)
  if (
    nodeId === 'bone_carpals' ||
    nodeId === 'bone_metacarpals' ||
    nodeId === 'bone_phalanges_hand' ||
    nodeId.startsWith('joint_wrist') ||
    nodeId === 'joint_thumb_cmc' ||
    nodeId === 'joint_intercarpal' ||
    nodeRegion === 'hand' ||
    text.includes('hand') ||
    text.includes('wrist') ||
    text.includes('carpal') ||
    text.includes('metacarpal') ||
    text.includes('thenar') ||
    text.includes('hypothenar') ||
    text.includes('palmaris_brevis') ||
    text.includes('palmaris brevis') ||
    text.includes('pollicis_brevis') ||
    text.includes('pollicis brevis') ||
    text.includes('policis_brevis') ||
    text.includes('policis brevis') ||
    text.includes('abductor_pollicis_brevis') ||
    text.includes('abductor pollicis brevis') ||
    text.includes('opponens_pollicis') ||
    text.includes('opponens pollicis') ||
    text.includes('adductor_pollicis') ||
    text.includes('adductor pollicis') ||
    text.includes('adductor_policis') ||
    text.includes('adductor policis') ||
    text.includes('interossei_of_hand') ||
    text.includes('interossei of hand') ||
    text.includes('lumbricals_of_hand') ||
    text.includes('lumbricals of hand') ||
    nodeId === 'atlas_abductor_digiti_minimi_r_84af0e15' ||
    text === 'abductor digiti minimi.r' ||
    text.includes('abductor_digiti_minimi_r') ||
    (text.includes('abductor') &&
      text.includes('digiti') &&
      text.includes('minimi') &&
      !text.includes('foot')) ||
    text.includes('digiti_minimi_of_hand') ||
    text.includes('digiti minimi of hand') ||
    text.includes('finger')
  ) {
    return 'hand';
  }

  // Humeral bone insertions/origins always attach to the humerus (arm), not the forearm
  if (
    nodeId === 'atlas_bracioradialis_muscle_humeral_insert_03bc4dad' ||
    text.includes('humeral_insert') ||
    text.includes('humeral insertion') ||
    text.includes('humeral_insertion')
  ) {
    return 'arm';
  }

  // 5. Forearm (Parented to elbow pivot)
  if (
    nodeId === 'bone_radius' ||
    nodeId === 'bone_ulna' ||
    nodeId === 'joint_elbow' ||
    nodeId === 'joint_proximal_radioulnar' ||
    nodeId === 'atlas_brachialis_muscle_ulnar_insertion_r_ee7c1b98' ||
    text.includes('ulnar_insertion') ||
    text.includes('ulnar insertion') ||
    text.includes('radius') ||
    text.includes('radial') ||
    text.includes('ulna') ||
    text.includes('ulnar') ||
    text.includes('elbow') ||
    text.includes('forearm') ||
    text.includes('antebrach') ||
    text.includes('brachioradialis') ||
    text.includes('carpi') ||
    text.includes('pronat') ||
    text.includes('pronta') ||
    text.includes('supinator') ||
    text.includes('anconeus') ||
    text.includes('palmaris_longus') ||
    text.includes('palmaris longus') ||
    text.includes('flexor_digitorum') ||
    text.includes('flexor digitorum') ||
    text.includes('extensor_digitorum') ||
    text.includes('extensor digitorum') ||
    text.includes('extensor_indicis') ||
    text.includes('extensor indicis') ||
    text.includes('extensor_pollicis') ||
    text.includes('extensor pollicis') ||
    text.includes('abductor_pollicis_longus') ||
    text.includes('abductor pollicis longus') ||
    text.includes('flexor_pollicis_longus') ||
    text.includes('flexor pollicis longus') ||
    nodeId === 'atlas_extensor_digiti_minimi_r_a77e7b69' ||
    text === 'extensor digiti minimi.r' ||
    text.includes('extensor_digiti_minimi') ||
    text.includes('extensor digiti minimi')
  ) {
    return 'forearm';
  }

  // 6. Thigh / Hip (Parented to hip pivot)
  if (
    nodeId === 'bone_femur' ||
    nodeId === 'joint_hip' ||
    isGastrocnemiusOrigin ||
    nodeId === 'atlas_origin_of_articularis_genus_r_85ebc333' ||
    text === 'origin of articularis genus.r' ||
    text.includes('articularis_genus') ||
    text.includes('articularis genus') ||
    text.includes('femur') ||
    text.includes('femoris') ||
    text.includes('thigh') ||
    text.includes('quadriceps') ||
    text.includes('vastus') ||
    text.includes('gluteus') ||
    text.includes('glute') ||
    (text.includes('adductor') &&
      !text.includes('pollicis') &&
      !text.includes('polic') &&
      !text.includes('hallucis')) ||
    text.includes('hamstring') ||
    text.includes('semitendinosus') ||
    text.includes('semimembranosus') ||
    text.includes('sartorius') ||
    text.includes('gracilis') ||
    text.includes('pectineus') ||
    text.includes('piriformis') ||
    text.includes('obturator') ||
    text.includes('gemellus') ||
    text.includes('tensor_fasciae_latae') ||
    text.includes('iliopsoas_ending') ||
    text.includes('iliopsoas ending') ||
    (text.includes('plantaris') && isPlantarisOrigin)
  ) {
    return 'thigh';
  }

  // 7. Arm (Parented to shoulder pivot)
  if (
    nodeId === 'bone_humerus' ||
    nodeId === 'joint_shoulder' ||
    nodeId === 'atlas_brachialis_anterior_muscle_humeral_i_5bacb069' ||
    isDeltoidHumeralInsertion ||
    isPectoralisHumeralInsertion ||
    isLatissimusHumeralInsertion ||
    isTeresMajorHumeralInsertion ||
    nodeRegion === 'arm' ||
    text.includes('humerus') ||
    text.includes('humeral') ||
    text.includes('biceps_brachii') ||
    text.includes('biceps brachii') ||
    (text.includes('biceps') && !text.includes('femoris')) ||
    (text.includes('brachialis') && !text.includes('brachioradialis')) ||
    (text.includes('triceps') && !text.includes('surae')) ||
    text.includes('coracobrachialis') ||
    text.includes('glenohumeral')
  ) {
    return 'arm';
  }

  // 8. Spine / Trunk / Head
  return 'spine';
}

export interface JointAngleState {
  elbowFlexion: number;
  shoulderAbduction: number;
  shoulderFlexion?: number;
  kneeFlexion: number;
  hipFlexion: number;
  hipAbduction?: number;
  spineFlexion: number;
  activeMotionLabel?: string;
}

export interface ProceduralJointAngles extends JointAngleState {
  leftShoulderAbduction: number;
  rightShoulderAbduction: number;
  leftShoulderFlexion: number;
  rightShoulderFlexion: number;
  leftElbowFlexion: number;
  rightElbowFlexion: number;
  leftHipFlexion: number;
  rightHipFlexion: number;
  leftHipAbduction: number;
  rightHipAbduction: number;
  leftKneeFlexion: number;
  rightKneeFlexion: number;
}

export interface KinematicPivotRotations {
  forearmRotationX: number;
  armRotationX?: number;
  armRotationZ: number;
  shinRotationX: number;
  thighRotationX: number;
  thighRotationZ?: number;
  spineRotationX: number;
}

/**
 * Computes exact Euler rotations (in radians) for each joint pivot group in Three.js coordinates.
 *
 * In Three.js right-handed coordinate space (where anterior/front is +Z and superior/up is +Y):
 * - Forearm hangs down (-Y): a negative rotation around X swings it forward (+Z, anterior) -> Elbow flexion.
 * - Shin hangs down (-Y): a positive rotation around X swings it backward (-Z, posterior) -> Knee flexion.
 * - Thigh hangs down (-Y): a negative rotation around X swings it forward (+Z, anterior) -> Hip flexion.
 * - Thigh hangs down (-Y): a positive rotation around Z swings it outward (+X laterally) -> Hip abduction.
 * - Spine extends up (+Y): a positive rotation around X bends it forward (+Z, anterior) -> Trunk flexion.
 * - Arm hangs down: a positive rotation around Z swings it laterally (+X) -> Shoulder abduction.
 * - Arm hangs down: a negative rotation around X swings it forward (+Z, anterior) -> Shoulder flexion.
 */
export function computeKinematicRotations(angles: Partial<JointAngleState>): KinematicPivotRotations {
  return {
    forearmRotationX: -(angles.elbowFlexion ?? 0),
    armRotationX: -(angles.shoulderFlexion ?? 0),
    armRotationZ: angles.shoulderAbduction ?? 0,
    shinRotationX: angles.kneeFlexion ?? 0,
    thighRotationX: -(angles.hipFlexion ?? 0),
    thighRotationZ: angles.hipAbduction ?? 0,
    spineRotationX: angles.spineFlexion ?? 0,
  };
}

export const ANIMATION_CYCLE_DURATION = 16.0;

/**
 * Computes procedural joint angles across a 16-second demonstration cycle.
 */
export function computeProceduralJointAngles(elapsedSeconds: number): ProceduralJointAngles {
  const phase = ((elapsedSeconds % ANIMATION_CYCLE_DURATION) + ANIMATION_CYCLE_DURATION) % ANIMATION_CYCLE_DURATION;

  // 0 - 4s: Elbow flexion / extension (0° to 125°)
  if (phase < 4.0) {
    const s = phase / 4.0;
    const angle = Math.pow(Math.sin(Math.PI * s), 2) * ((125 * Math.PI) / 180);
    return {
      elbowFlexion: angle,
      shoulderAbduction: 0,
      kneeFlexion: 0,
      hipFlexion: 0,
      spineFlexion: 0,
      leftElbowFlexion: angle,
      rightElbowFlexion: angle,
      leftShoulderAbduction: 0,
      rightShoulderAbduction: 0,
      leftShoulderFlexion: 0,
      rightShoulderFlexion: 0,
      leftKneeFlexion: 0,
      rightKneeFlexion: 0,
      leftHipFlexion: 0,
      rightHipFlexion: 0,
      leftHipAbduction: 0,
      rightHipAbduction: 0,
      activeMotionLabel: 'Elbow flexion & extension',
    };
  }

  // 4 - 8s: Shoulder abduction / adduction (0° to 80°)
  if (phase < 8.0) {
    const s = (phase - 4.0) / 4.0;
    const angle = Math.pow(Math.sin(Math.PI * s), 2) * ((80 * Math.PI) / 180);
    return {
      elbowFlexion: 0,
      shoulderAbduction: angle,
      kneeFlexion: 0,
      hipFlexion: 0,
      spineFlexion: 0,
      leftElbowFlexion: 0,
      rightElbowFlexion: 0,
      leftShoulderAbduction: angle,
      rightShoulderAbduction: angle,
      leftShoulderFlexion: 0,
      rightShoulderFlexion: 0,
      leftKneeFlexion: 0,
      rightKneeFlexion: 0,
      leftHipFlexion: 0,
      rightHipFlexion: 0,
      leftHipAbduction: 0,
      rightHipAbduction: 0,
      activeMotionLabel: 'Shoulder abduction & adduction',
    };
  }

  // 8 - 12s: Knee flexion / extension (0° to 90°)
  if (phase < 12.0) {
    const s = (phase - 8.0) / 4.0;
    const angle = Math.pow(Math.sin(Math.PI * s), 2) * ((90 * Math.PI) / 180);
    return {
      elbowFlexion: 0,
      shoulderAbduction: 0,
      kneeFlexion: angle,
      hipFlexion: 0,
      spineFlexion: 0,
      leftElbowFlexion: 0,
      rightElbowFlexion: 0,
      leftShoulderAbduction: 0,
      rightShoulderAbduction: 0,
      leftShoulderFlexion: 0,
      rightShoulderFlexion: 0,
      leftKneeFlexion: angle,
      rightKneeFlexion: angle,
      leftHipFlexion: 0,
      rightHipFlexion: 0,
      leftHipAbduction: 0,
      rightHipAbduction: 0,
      activeMotionLabel: 'Knee flexion & extension',
    };
  }

  // 12 - 16s: Hip flexion (0° to 45°) & Spine bend (0° to 15°)
  const s = (phase - 12.0) / 4.0;
  const hipAngle = Math.pow(Math.sin(Math.PI * s), 2) * ((45 * Math.PI) / 180);
  const spineAngle = Math.pow(Math.sin(Math.PI * s), 2) * ((15 * Math.PI) / 180);
  return {
    elbowFlexion: 0,
    shoulderAbduction: 0,
    kneeFlexion: 0,
    hipFlexion: hipAngle,
    spineFlexion: spineAngle,
    leftElbowFlexion: 0,
    rightElbowFlexion: 0,
    leftShoulderAbduction: 0,
    rightShoulderAbduction: 0,
    leftShoulderFlexion: 0,
    rightShoulderFlexion: 0,
    leftKneeFlexion: 0,
    rightKneeFlexion: 0,
    leftHipFlexion: hipAngle,
    rightHipFlexion: hipAngle,
    leftHipAbduction: 0,
    rightHipAbduction: 0,
    activeMotionLabel: 'Hip & trunk motion',
  };
}

/**
 * Deforms a dual-anchored bridging muscle mesh (like Psoas major) between the torso/spine and thigh.
 * Top vertices (Y >= 1.05) stay rigidly anchored to the lumbar spine / torso.
 * Bottom vertices (Y <= 0.82) follow the lesser trochanter on the femur.
 * Intermediate vertices smoothly blend, preventing the muscle from protruding through the back.
 */
export function deformBridgingPsoasMesh(
  mesh: THREE.Mesh,
  thetaHip: number,
  thetaSpine: number,
  thetaHipZ: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosH = Math.cos(thetaHip);
  const sinH = Math.sin(thetaHip);
  const cosHZ = Math.cos(thetaHipZ);
  const sinHZ = Math.sin(thetaHipZ);
  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);

  const hip = KINEMATIC_PIVOTS.hip;
  const spine = KINEMATIC_PIVOTS.spine;

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // Thigh transform around hip pivot (Three.js Euler 'XYZ': Z first, then X)
    const dxH = x0 - hip.x;
    const dyH = y0 - hip.y;
    const dzH = z0 - hip.z;

    const xThigh_Z = dxH * cosHZ - dyH * sinHZ;
    const yThigh_Z = dxH * sinHZ + dyH * cosHZ;
    const zThigh_Z = dzH;

    const xThigh = hip.x + xThigh_Z;
    const yThigh = hip.y + (yThigh_Z * cosH - zThigh_Z * sinH);
    const zThigh = hip.z + (yThigh_Z * sinH + zThigh_Z * cosH);

    // Spine transform around spine pivot
    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    // Smooth weight between spine (w = 0) and thigh (w = 1)
    let t = (1.05 - y0) / (1.05 - 0.82);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    arr[idx] = (1 - w) * x0 + w * xThigh;
    arr[idx + 1] = (1 - w) * ySpine + w * yThigh;
    arr[idx + 2] = (1 - w) * zSpine + w * zThigh;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isPsoasMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return text.includes('psoas');
}

export function isPlantarisMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isOrigin =
    mesh.name === 'atlas_plantaris_muscle_medially_to_the_lat_143de19a' ||
    mesh.name === 'atlas_plantaris_muscle_medially_to_the_lat_3ef61b75' ||
    text.includes('origin') ||
    text.includes('orig') ||
    text.includes('medially_to_the_lat');
  return (
    mesh.name === 'atlas_plantaris_muscle_r_5a2fd02c' ||
    (text.includes('plantaris') && !isOrigin)
  );
}

/**
 * Deforms a dual-anchored bridging muscle mesh (Plantaris) across the knee joint between the femur (thigh) and shin/foot.
 * Top vertices (Y >= 0.485) stay rigidly anchored to the distal posterior femur (thigh).
 * Lower vertices (Y <= 0.410) follow the shin/calcaneus (knee flexion).
 * Intermediate vertices smoothly blend across the posterior knee joint, preventing the upper end
 * from detaching or protruding forward through the femur and knee.
 */
export function deformBridgingPlantarisMesh(
  mesh: THREE.Mesh,
  thetaThigh: number,
  thetaShin: number,
  thetaThighZ: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosK = Math.cos(thetaShin);
  const sinK = Math.sin(thetaShin);
  const cosH = Math.cos(thetaThigh);
  const sinH = Math.sin(thetaThigh);
  const cosHZ = Math.cos(thetaThighZ);
  const sinHZ = Math.sin(thetaThighZ);

  const knee = KINEMATIC_PIVOTS.knee;
  const hip = KINEMATIC_PIVOTS.hip;

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // --- 1. Thigh transform around hip pivot (Three.js Euler 'XYZ': Z first, then X) ---
    const dxH = x0 - hip.x;
    const dyH = y0 - hip.y;
    const dzH = z0 - hip.z;

    const xThigh_Z = dxH * cosHZ - dyH * sinHZ;
    const yThigh_Z = dxH * sinHZ + dyH * cosHZ;
    const zThigh_Z = dzH;

    const xThigh = hip.x + xThigh_Z;
    const yThigh = hip.y + (yThigh_Z * cosH - zThigh_Z * sinH);
    const zThigh = hip.z + (yThigh_Z * sinH + zThigh_Z * cosH);

    // --- 2. Shin transform: knee pivot followed by hip pivot (Z first, then X) ---
    const dyK = y0 - knee.y;
    const dzK = z0 - knee.z;
    const yK = knee.y + (dyK * cosK - dzK * sinK);
    const zK = knee.z + (dyK * sinK + dzK * cosK);

    const dxShin_H = x0 - hip.x;
    const dyShin_H = yK - hip.y;
    const dzShin_H = zK - hip.z;

    const xShin_Z = dxShin_H * cosHZ - dyShin_H * sinHZ;
    const yShin_Z = dxShin_H * sinHZ + dyShin_H * cosHZ;
    const zShin_Z = dzShin_H;

    const xShin = hip.x + xShin_Z;
    const yShin = hip.y + (yShin_Z * cosH - zShin_Z * sinH);
    const zShin = hip.z + (yShin_Z * sinH + zShin_Z * cosH);

    // --- 3. Smooth blend across knee joint ---
    // Smooth weight between shin (w = 1 at y0 <= 0.410) and femur (w = 0 at y0 >= 0.485)
    let t = (0.485 - y0) / (0.485 - 0.410);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const wShin = t * t * (3 - 2 * t);
    const wThigh = 1 - wShin;

    arr[idx] = wThigh * xThigh + wShin * xShin;
    arr[idx + 1] = wThigh * yThigh + wShin * yShin;
    arr[idx + 2] = wThigh * zThigh + wShin * zShin;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isTransversusAbdominisMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    text.includes('transversus_abdominis') ||
    text.includes('transversus abdominis') ||
    (text.includes('transverse') && text.includes('abdomin') && !text.includes('insertion'))
  );
}

/**
 * Deforms a dual-anchored bridging muscle mesh (Transversus abdominis) between the pelvis and ribcage/thorax.
 * Lower vertices (along the iliac crest, inguinal ligament, and pubic crest) stay rigidly anchored to the pelvis.
 * Upper vertices (Y >= 1.12) follow the costal margin on the ribcage.
 * Intermediate vertices smoothly blend and squash/stretch when the torso flexes or extends,
 * preventing the lower abdominal wall from detaching or cutting into the pelvic cavity while
 * preserving abdominal volume.
 */
export function deformBridgingTransversusAbdominisMesh(
  mesh: THREE.Mesh,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);

  const spine = KINEMATIC_PIVOTS.spine;
  const arr = posAttr.array as Float32Array;

  const C_squash = 0.045;
  const C_lat = 0.08;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // Spine/ribcage transform around spine pivot
    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    // Pelvic attachment contour rises from Y ≈ 0.94 anteriorly (inguinal/pubis)
    // to Y ≈ 0.98 laterally/posteriorly along the iliac crest
    const yBot = 0.98 - 0.6 * Math.max(0, z0 - 0.01);
    const yTop = 1.12;

    let t = (y0 - yBot) / (yTop - yBot);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let x = x0;
    let y = (1 - w) * y0 + w * ySpine;
    let z = (1 - w) * z0 + w * zSpine;

    // Squash & stretch: volume preservation of the abdominal cavity
    if (thetaSpine !== 0 && t > 0 && t < 1) {
      const bulgeProfile = Math.sin(Math.PI * t);
      const zFactor = Math.max(0, (z0 - (-0.01)) / 0.11);
      z += C_squash * sinS * bulgeProfile * zFactor;
      x += C_lat * sinS * bulgeProfile * zFactor * x0;
    }

    arr[idx] = x;
    arr[idx + 1] = y;
    arr[idx + 2] = z;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isFasciaLataMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    mesh.name === 'atlas_fascia_lata_r_d92bb3d0' ||
    text.includes('fascia_lata') ||
    text.includes('fascia lata')
  );
}

/**
 * Deforms the multi-joint bridging Fascia lata mesh across leg animations.
 *
 * Lower vertices (along Gerdy's tubercle on the lateral tibial condyle, head of the fibula,
 * and patellar retinaculum at Y <= 0.410) follow the shin as the knee flexes and stretches.
 * Across the knee joint line (Y in [0.410, 0.470]), vertices smoothly blend along the arc of the
 * lateral femoral condyle, preventing volume collapse or bone interpenetration.
 *
 * Thigh body vertices (Y in [0.470, 0.850]) swing with the femur around the hip pivot.
 *
 * Upper vertices (along the iliac crest of the pelvis at Y >= 0.960) remain anchored to the
 * pelvis, smoothly stretching and adapting as the hip flexes and extends.
 */
export function deformBridgingFasciaLataMesh(
  mesh: THREE.Mesh,
  thetaHip: number,
  thetaKnee: number,
  thetaHipZ: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const knee = KINEMATIC_PIVOTS.knee;
  const hip = KINEMATIC_PIVOTS.hip;
  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // 1. Distal / Knee transition:
    // Below 0.410: fully follows shin (wK = 1)
    // Above 0.470: fully follows thigh (wK = 0)
    let tK = (0.470 - y0) / (0.470 - 0.410);
    if (tK < 0) tK = 0;
    if (tK > 1) tK = 1;
    const wK = tK * tK * (3 - 2 * tK);
    const thetaK_eff = wK * thetaKnee;

    const cosK_eff = Math.cos(thetaK_eff);
    const sinK_eff = Math.sin(thetaK_eff);

    const dyK = y0 - knee.y;
    const dzK = z0 - knee.z;
    const yK_prime = knee.y + (dyK * cosK_eff - dzK * sinK_eff);
    const zK_prime = knee.z + (dyK * sinK_eff + dzK * cosK_eff);

    // 2. Proximal / Hip transition:
    // Above 0.960: anchored to pelvis / iliac crest (wH = 1 -> thetaH_eff = 0)
    // Below 0.850: moves with thigh (wH = 0 -> thetaH_eff = thetaHip)
    let tH = (y0 - 0.850) / (0.960 - 0.850);
    if (tH < 0) tH = 0;
    if (tH > 1) tH = 1;
    const wH = tH * tH * (3 - 2 * tH);

    // Lateral outward abduction around Z axis
    const thetaHZ_eff = (1 - wH) * thetaHipZ;
    const cosHZ = Math.cos(thetaHZ_eff);
    const sinHZ = Math.sin(thetaHZ_eff);

    const dxH = x0 - hip.x;
    const dyH_forZ = yK_prime - hip.y;
    const xH_prime = hip.x + (dxH * cosHZ - dyH_forZ * sinHZ);
    const yH_prime = hip.y + (dxH * sinHZ + dyH_forZ * cosHZ);

    // Anterior / posterior flexion around X axis
    const thetaHX_eff = (1 - wH) * thetaHip;
    const cosHX = Math.cos(thetaHX_eff);
    const sinHX = Math.sin(thetaHX_eff);

    const dyHX = yH_prime - hip.y;
    const dzHX = zK_prime - hip.z;
    const yFinal = hip.y + (dyHX * cosHX - dzHX * sinHX);
    const zFinal = hip.z + (dyHX * sinHX + dzHX * cosHX);

    arr[idx] = xH_prime;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

/**
 * Universal dispatcher to deform any bridging mesh across its anchored kinematic joints.
 */
export function isBrachioradialisMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isHumeralInsert =
    mesh.name === 'atlas_bracioradialis_muscle_humeral_insert_03bc4dad' ||
    text.includes('humeral_insert') ||
    text.includes('humeral insertion');
  return (
    (mesh.name === 'muscle_brachioradialis' ||
      text === 'brachioradialis' ||
      text.includes('brachioradialis') ||
      text.includes('bracioradialis')) &&
    !isHumeralInsert
  );
}

/**
 * Deforms the dual-anchored Brachioradialis muscle mesh across the elbow joint between
 * the lateral supracondylar ridge of the humerus (arm) and the styloid process of the radius (forearm).
 * Proximal vertices (Y >= 1.140) follow the arm / shoulder transform.
 * Distal vertices (Y <= 0.950) follow the forearm / elbow transform.
 * Intermediate vertices smoothly blend across the joint and pull tighter inward during elbow flexion,
 * keeping the muscle bend nestled inside the crook of the elbow joint rather than bowing outward.
 */
export function deformBridgingBrachioradialisMesh(
  mesh: THREE.Mesh,
  thetaForearmX: number,
  thetaArmZ: number = 0,
  thetaArmX: number = 0,
  thetaSpineX: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosFE = Math.cos(thetaForearmX);
  const sinFE = Math.sin(thetaForearmX);

  const cosAZ = Math.cos(thetaArmZ);
  const sinAZ = Math.sin(thetaArmZ);
  const cosAX = Math.cos(thetaArmX);
  const sinAX = Math.sin(thetaArmX);

  const cosS = Math.cos(thetaSpineX);
  const sinS = Math.sin(thetaSpineX);

  const elbow = KINEMATIC_PIVOTS.elbow;
  const shoulder = KINEMATIC_PIVOTS.shoulder;
  const spine = KINEMATIC_PIVOTS.spine;

  const thetaFlex = Math.max(0, -thetaForearmX);
  const flexTightness = Math.sin(Math.min(Math.PI / 2, thetaFlex));

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // 1. Forearm rotation around elbow pivot
    const dyE = y0 - elbow.y;
    const dzE = z0 - elbow.z;
    const yFE = elbow.y + (dyE * cosFE - dzE * sinFE);
    const zFE = elbow.z + (dyE * sinFE + dzE * cosFE);

    // 2. Blend across elbow joint between humerus (arm, y0 >= 1.140) and radius (forearm, y0 <= 0.950)
    let t = (1.140 - y0) / (1.140 - 0.950);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let xMid = x0;
    let yMid = (1 - w) * y0 + w * yFE;
    let zMid = (1 - w) * z0 + w * zFE;

    // 3. Pull tighter across the elbow joint during flexion to keep the bend inside the joint
    if (thetaFlex > 0 && t > 0 && t < 1) {
      const b = Math.sin(Math.PI * t);
      // Pull inward (medially) and deeper into the crook of the elbow joint
      xMid -= 0.018 * flexTightness * b * (x0 >= 0 ? 1 : -1);
      zMid -= 0.014 * flexTightness * b;
    }

    // 4. Shoulder transform (Three.js Euler 'XYZ': Z abduction first, then X flexion second)
    const dxS = xMid - shoulder.x;
    const dyS = yMid - shoulder.y;
    const dzS = zMid - shoulder.z;

    const xSZ = dxS * cosAZ - dyS * sinAZ;
    const ySZ = dxS * sinAZ + dyS * cosAZ;
    const zSZ = dzS;

    const xArm = shoulder.x + xSZ;
    const yArm = shoulder.y + (ySZ * cosAX - zSZ * sinAX);
    const zArm = shoulder.z + (ySZ * sinAX + zSZ * cosAX);

    // 5. Spine transform (Spine flexion around spine pivot)
    const dySp = yArm - spine.y;
    const dzSp = zArm - spine.z;
    const yFinal = spine.y + (dySp * cosS - dzSp * sinS);
    const zFinal = spine.z + (dySp * sinS + dzSp * cosS);

    arr[idx] = xArm;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isBicepsBrachiiMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isRadialInsert =
    mesh.name === 'atlas_biceps_brachii_muscle_radial_inserti_5a9942a5' ||
    text.includes('radial_insert') ||
    text.includes('radial insertion');
  return (
    (mesh.name === 'muscle_biceps_brachii' ||
      text === 'biceps brachii' ||
      text.includes('biceps_brachii') ||
      (text.includes('biceps') && text.includes('brachii'))) &&
    !isRadialInsert
  );
}

/**
 * Deforms the dual-anchored Biceps brachii muscle mesh across the elbow joint between
 * the scapula/shoulder (arm) and the radial tuberosity of the radius (forearm).
 * Proximal vertices (Y >= 1.160, extending to 1.408) follow the arm / shoulder transform.
 * Distal vertices (Y <= 1.074) follow the forearm / elbow transform.
 * Mid-belly vertices (Y in [1.08, 1.36]) squash along length and bulge anteriorly/radially
 * during elbow flexion, creating realistic muscle contraction while keeping both ends firmly constrained.
 */
export function deformBridgingBicepsBrachiiMesh(
  mesh: THREE.Mesh,
  thetaForearmX: number,
  thetaArmZ: number = 0,
  thetaArmX: number = 0,
  thetaSpineX: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosFE = Math.cos(thetaForearmX);
  const sinFE = Math.sin(thetaForearmX);

  const cosAZ = Math.cos(thetaArmZ);
  const sinAZ = Math.sin(thetaArmZ);
  const cosAX = Math.cos(thetaArmX);
  const sinAX = Math.sin(thetaArmX);

  const cosS = Math.cos(thetaSpineX);
  const sinS = Math.sin(thetaSpineX);

  const elbow = KINEMATIC_PIVOTS.elbow;
  const shoulder = KINEMATIC_PIVOTS.shoulder;
  const spine = KINEMATIC_PIVOTS.spine;

  const thetaFlex = Math.max(0, -thetaForearmX);
  const sinFlex = Math.sin(thetaFlex);

  // Reference displacement of the radial insertion (y0 ≈ 1.060, z0 ≈ -0.020) around elbow pivot
  const dyIns = 1.060 - elbow.y;
  const dzIns = -0.020 - elbow.z;
  const yInsFE = elbow.y + (dyIns * cosFE - dzIns * sinFE);
  const zInsFE = elbow.z + (dyIns * sinFE + dzIns * cosFE);
  const deltaYIns = yInsFE - 1.060;
  const deltaZIns = zInsFE - (-0.020);

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // Normalized parameter from shoulder (y0 >= 1.380, u = 0) to radial insertion (y0 <= 1.060, u = 1)
    let u = (1.380 - y0) / (1.380 - 1.060);
    if (u < 0) u = 0;
    if (u > 1) u = 1;
    const w = u * u * (3 - 2 * u);

    let xMid = x0;
    let yMid = y0;
    let zMid = z0;

    if (y0 <= 1.074) {
      // Distal radial insertion strictly follows forearm rotation around elbow pivot
      const dyE = y0 - elbow.y;
      const dzE = z0 - elbow.z;
      yMid = elbow.y + (dyE * cosFE - dzE * sinFE);
      zMid = elbow.z + (dyE * sinFE + dzE * cosFE);
    } else {
      // Belly shortens along arm as the radial insertion pulls upward
      yMid = y0 + w * deltaYIns;
      zMid = z0 + w * deltaZIns;

      // Natural muscular squash & bulge (modest anterior bulge and radial thickening that stays hugged to bone)
      if (thetaFlex > 0 && u > 0 && u < 1) {
        const b = Math.sin(Math.PI * u);
        zMid += 0.014 * sinFlex * b;
        const xOffset = Math.abs(x0) - 0.185;
        xMid += 0.008 * sinFlex * b * (xOffset / 0.04) * (x0 >= 0 ? 1 : -1);
      }
    }

    // 4. Shoulder transform (Three.js Euler 'XYZ': Z abduction first, then X flexion second)
    const dxS = xMid - shoulder.x;
    const dyS = yMid - shoulder.y;
    const dzS = zMid - shoulder.z;

    const xSZ = dxS * cosAZ - dyS * sinAZ;
    const ySZ = dxS * sinAZ + dyS * cosAZ;
    const zSZ = dzS;

    const xArm = shoulder.x + xSZ;
    const yArm = shoulder.y + (ySZ * cosAX - zSZ * sinAX);
    const zArm = shoulder.z + (ySZ * sinAX + zSZ * cosAX);

    // 5. Spine transform (Spine flexion around spine pivot)
    const dySp = yArm - spine.y;
    const dzSp = zArm - spine.z;
    const yFinal = spine.y + (dySp * cosS - dzSp * sinS);
    const zFinal = spine.z + (dySp * sinS + dzSp * cosS);

    arr[idx] = xArm;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isQuadricepsMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isPatellarOrOrigin =
    mesh.name === 'atlas_quadriceps_femoris_on_base_of_patell_0a32a9b6' ||
    mesh.name.startsWith('atlas_origin_of_vastus') ||
    text.includes('origin_of_vastus') ||
    text.includes('on_base_of_patell') ||
    text.includes('patellar') ||
    text.includes('patella');
  if (isPatellarOrOrigin) return false;

  return (
    mesh.name === 'muscle_quadriceps_rectus_femoris' ||
    mesh.name === 'muscle_vastus_lateralis' ||
    mesh.name === 'muscle_vastus_medialis' ||
    mesh.name === 'muscle_vastus_intermedius' ||
    text.includes('rectus_femoris') ||
    text.includes('rectus femoris') ||
    text.includes('vastus_lateralis') ||
    text.includes('vastus lateralis') ||
    text.includes('vastus_medialis') ||
    text.includes('vastus medialis') ||
    text.includes('vastus_intermedius') ||
    text.includes('vastus intermedius') ||
    text.includes('quadriceps') ||
    text.includes('vastus')
  );
}

/**
 * Deforms the multi-joint Quadriceps femoris muscle bellies (Rectus femoris and Vasti) across
 * hip and knee motions.
 * Distal insertions (base of patella / tibial tuberosity at Y <= 0.410) follow the shin.
 * Across the knee joint line (Y in [0.410, 0.470]), vertices smoothly wrap along the arc of the
 * femoral condyles, preventing bone clipping.
 * Proximal ends: Vasti follow the femur shaft around the hip pivot; Rectus femoris anchors to
 * the anterior inferior iliac spine (AIIS) on the pelvis (Y >= 0.885).
 */
export function deformBridgingQuadricepsMesh(
  mesh: THREE.Mesh,
  thetaThighX: number,
  thetaShinX: number,
  thetaThighZ: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const isRectusFemoris =
    mesh.name === 'muscle_quadriceps_rectus_femoris' ||
    (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase().includes('rectus_femoris') ||
    (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase().includes('rectus femoris');

  const knee = KINEMATIC_PIVOTS.knee;
  const hip = KINEMATIC_PIVOTS.hip;
  const arr = posAttr.array as Float32Array;

  const thetaHflex = Math.max(0, -thetaThighX);
  const sinHflex = Math.sin(thetaHflex);

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    let x0 = orig[idx];
    const y0 = orig[idx + 1];
    let z0 = orig[idx + 2];

    // Rectus femoris belly bulge during hip flexion
    if (isRectusFemoris && sinHflex > 0) {
      let tBelly = (y0 - 0.50) / (0.85 - 0.50);
      if (tBelly > 0 && tBelly < 1) {
        z0 += 0.020 * sinHflex * Math.sin(Math.PI * tBelly);
      }
    }

    // 1. Distal knee blend:
    // Below 0.410: fully follows shin (wK = 1)
    // Above 0.470: fully follows thigh (wK = 0)
    let tK = (0.470 - y0) / (0.470 - 0.410);
    if (tK < 0) tK = 0;
    if (tK > 1) tK = 1;
    const wK = tK * tK * (3 - 2 * tK);
    const thetaK_eff = wK * thetaShinX;

    const cosK = Math.cos(thetaK_eff);
    const sinK = Math.sin(thetaK_eff);

    const dyK = y0 - knee.y;
    const dzK = z0 - knee.z;
    const yK_prime = knee.y + (dyK * cosK - dzK * sinK);
    const zK_prime = knee.z + (dyK * sinK + dzK * cosK);

    // 2. Proximal hip blend:
    // Rectus femoris originates on AIIS on pelvis (y0 >= 0.885).
    // Vasti originate on the femur shaft and move with thigh.
    let wH = 0;
    if (isRectusFemoris) {
      let tH = (y0 - 0.820) / (0.885 - 0.820);
      if (tH < 0) tH = 0;
      if (tH > 1) tH = 1;
      wH = tH * tH * (3 - 2 * tH);
    }

    const thetaHZ_eff = (1 - wH) * thetaThighZ;
    const cosHZ = Math.cos(thetaHZ_eff);
    const sinHZ = Math.sin(thetaHZ_eff);

    const dxH = x0 - hip.x;
    const dyH_forZ = yK_prime - hip.y;
    const xH_prime = hip.x + (dxH * cosHZ - dyH_forZ * sinHZ);
    const yH_prime = hip.y + (dxH * sinHZ + dyH_forZ * cosHZ);

    const thetaHX_eff = (1 - wH) * thetaThighX;
    const cosHX = Math.cos(thetaHX_eff);
    const sinHX = Math.sin(thetaHX_eff);

    const dyHX = yH_prime - hip.y;
    const dzHX = zK_prime - hip.z;
    const yFinal = hip.y + (dyHX * cosHX - dzHX * sinHX);
    const zFinal = hip.z + (dyHX * sinHX + dzHX * cosHX);

    arr[idx] = xH_prime;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isSartoriusMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isPatch =
    mesh.name === 'atlas_sartorius_muscle_on_upper_anterior_i_a4219826' ||
    mesh.name === 'atlas_sartorius_on_patte_d_oie_r_114b15fb' ||
    text.includes('patte') ||
    text.includes('anterior_i') ||
    text.includes('iliac');
  return (
    (mesh.name === 'muscle_sartorius' ||
      text === 'sartorius' ||
      text.includes('sartorius')) &&
    !isPatch
  );
}

/**
 * Deforms the multi-joint Sartorius muscle ribbon between the ASIS on the pelvis (Y >= 0.880)
 * and the pes anserinus on the medial tibia (Y <= 0.410).
 * Stretches smoothly across hip flexion, hip abduction, and knee flexion.
 */
export function deformBridgingSartoriusMesh(
  mesh: THREE.Mesh,
  thetaThighX: number,
  thetaShinX: number,
  thetaThighZ: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const knee = KINEMATIC_PIVOTS.knee;
  const hip = KINEMATIC_PIVOTS.hip;
  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // 1. Distal knee blend (insertion at pes anserinus on medial tibia at y0 <= 0.410)
    let tK = (0.470 - y0) / (0.470 - 0.410);
    if (tK < 0) tK = 0;
    if (tK > 1) tK = 1;
    const wK = tK * tK * (3 - 2 * tK);
    const thetaK_eff = wK * thetaShinX;

    const cosK = Math.cos(thetaK_eff);
    const sinK = Math.sin(thetaK_eff);

    const dyK = y0 - knee.y;
    const dzK = z0 - knee.z;
    const yK_prime = knee.y + (dyK * cosK - dzK * sinK);
    const zK_prime = knee.z + (dyK * sinK + dzK * cosK);

    // 2. Proximal hip blend (origin at ASIS on pelvis at y0 >= 0.880)
    let tH = (y0 - 0.830) / (0.880 - 0.830);
    if (tH < 0) tH = 0;
    if (tH > 1) tH = 1;
    const wH = tH * tH * (3 - 2 * tH);

    const thetaHZ_eff = (1 - wH) * thetaThighZ;
    const cosHZ = Math.cos(thetaHZ_eff);
    const sinHZ = Math.sin(thetaHZ_eff);

    const dxH = x0 - hip.x;
    const dyH_forZ = yK_prime - hip.y;
    const xH_prime = hip.x + (dxH * cosHZ - dyH_forZ * sinHZ);
    const yH_prime = hip.y + (dxH * sinHZ + dyH_forZ * cosHZ);

    const thetaHX_eff = (1 - wH) * thetaThighX;
    const cosHX = Math.cos(thetaHX_eff);
    const sinHX = Math.sin(thetaHX_eff);

    const dyHX = yH_prime - hip.y;
    const dzHX = zK_prime - hip.z;
    const yFinal = hip.y + (dyHX * cosHX - dzHX * sinHX);
    const zFinal = hip.z + (dyHX * sinHX + dzHX * cosHX);

    arr[idx] = xH_prime;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isHamstringsMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isPatch =
    mesh.name === 'atlas_long_head_of_biceps_femoris_muscle_i_69d2859a' ||
    mesh.name === 'atlas_long_head_of_biceps_femoris_on_fibul_ed8ca122' ||
    text.includes('ischiat') ||
    text.includes('fibul') ||
    text.includes('patte');
  if (isPatch) return false;

  return (
    mesh.name === 'muscle_hamstrings_biceps_femoris' ||
    mesh.name === 'muscle_semitendinosus' ||
    mesh.name === 'muscle_semimembranosus' ||
    text.includes('hamstring') ||
    text.includes('semitendinosus') ||
    text.includes('semimembranosus') ||
    (text.includes('biceps') && text.includes('femoris'))
  );
}

/**
 * Deforms the dual-anchored Hamstrings muscle bellies (Biceps femoris, Semitendinosus, Semimembranosus)
 * between the ischial tuberosity on the pelvis (Y >= 0.800) and the head of the fibula / tibia (Y <= 0.410).
 * During knee flexion, the belly squashes along its length and bulges posteriorly into negative Z,
 * matching natural knee flexor contraction while keeping both ends firmly anchored.
 */
export function deformBridgingHamstringsMesh(
  mesh: THREE.Mesh,
  thetaThighX: number,
  thetaShinX: number,
  thetaThighZ: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const knee = KINEMATIC_PIVOTS.knee;
  const hip = KINEMATIC_PIVOTS.hip;
  const arr = posAttr.array as Float32Array;

  const sinKnee = Math.sin(Math.max(0, thetaShinX));

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    let x0 = orig[idx];
    const y0 = orig[idx + 1];
    let z0 = orig[idx + 2];

    // Squash & stretch (posterior belly bulge during knee flexion)
    let tBelly = (y0 - 0.460) / (0.760 - 0.460);
    if (sinKnee > 0 && tBelly > 0 && tBelly < 1) {
      const b = Math.sin(Math.PI * tBelly);
      z0 -= 0.026 * sinKnee * b;
      x0 += 0.012 * sinKnee * b * ((x0 - hip.x) / 0.04);
    }

    // 1. Distal knee blend (insertions at head of fibula and medial tibia at y0 <= 0.410)
    let tK = (0.460 - y0) / (0.460 - 0.410);
    if (tK < 0) tK = 0;
    if (tK > 1) tK = 1;
    const wK = tK * tK * (3 - 2 * tK);
    const thetaK_eff = wK * thetaShinX;

    const cosK = Math.cos(thetaK_eff);
    const sinK = Math.sin(thetaK_eff);

    const dyK = y0 - knee.y;
    const dzK = z0 - knee.z;
    const yK_prime = knee.y + (dyK * cosK - dzK * sinK);
    const zK_prime = knee.z + (dyK * sinK + dzK * cosK);

    // 2. Proximal hip blend (origin at ischial tuberosity on pelvis at y0 >= 0.800)
    let tH = (y0 - 0.760) / (0.800 - 0.760);
    if (tH < 0) tH = 0;
    if (tH > 1) tH = 1;
    const wH = tH * tH * (3 - 2 * tH);

    const thetaHZ_eff = (1 - wH) * thetaThighZ;
    const cosHZ = Math.cos(thetaHZ_eff);
    const sinHZ = Math.sin(thetaHZ_eff);

    const dxH = x0 - hip.x;
    const dyH_forZ = yK_prime - hip.y;
    const xH_prime = hip.x + (dxH * cosHZ - dyH_forZ * sinHZ);
    const yH_prime = hip.y + (dxH * sinHZ + dyH_forZ * cosHZ);

    const thetaHX_eff = (1 - wH) * thetaThighX;
    const cosHX = Math.cos(thetaHX_eff);
    const sinHX = Math.sin(thetaHX_eff);

    const dyHX = yH_prime - hip.y;
    const dzHX = zK_prime - hip.z;
    const yFinal = hip.y + (dyHX * cosHX - dzHX * sinHX);
    const zFinal = hip.z + (dyHX * sinHX + dzHX * cosHX);

    arr[idx] = xH_prime;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isGracilisMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isPatch =
    mesh.name === 'atlas_gracilis_muscle_pubic_insertion_r_3568d7dc' ||
    mesh.name === 'atlas_gracilis_on_patte_d_oie_r_c1543752' ||
    text.includes('pubic') ||
    text.includes('patte');
  return (
    (mesh.name === 'muscle_gracilis' ||
      text === 'gracilis' ||
      text.includes('gracilis')) &&
    !isPatch
  );
}

/**
 * Deforms the dual-anchored Gracilis muscle strap between the pubic bone on the pelvis (Y >= 0.800)
 * and the pes anserinus on the medial tibia (Y <= 0.410).
 * Stretches across hip abduction, hip flexion, and knee flexion.
 */
export function deformBridgingGracilisMesh(
  mesh: THREE.Mesh,
  thetaThighX: number,
  thetaShinX: number,
  thetaThighZ: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const knee = KINEMATIC_PIVOTS.knee;
  const hip = KINEMATIC_PIVOTS.hip;
  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // 1. Distal knee blend (insertion at pes anserinus on medial tibia at y0 <= 0.410)
    let tK = (0.460 - y0) / (0.460 - 0.410);
    if (tK < 0) tK = 0;
    if (tK > 1) tK = 1;
    const wK = tK * tK * (3 - 2 * tK);
    const thetaK_eff = wK * thetaShinX;

    const cosK = Math.cos(thetaK_eff);
    const sinK = Math.sin(thetaK_eff);

    const dyK = y0 - knee.y;
    const dzK = z0 - knee.z;
    const yK_prime = knee.y + (dyK * cosK - dzK * sinK);
    const zK_prime = knee.z + (dyK * sinK + dzK * cosK);

    // 2. Proximal hip blend (origin at pubic bone on pelvis at y0 >= 0.800)
    let tH = (y0 - 0.760) / (0.800 - 0.760);
    if (tH < 0) tH = 0;
    if (tH > 1) tH = 1;
    const wH = tH * tH * (3 - 2 * tH);

    const thetaHZ_eff = (1 - wH) * thetaThighZ;
    const cosHZ = Math.cos(thetaHZ_eff);
    const sinHZ = Math.sin(thetaHZ_eff);

    const dxH = x0 - hip.x;
    const dyH_forZ = yK_prime - hip.y;
    const xH_prime = hip.x + (dxH * cosHZ - dyH_forZ * sinHZ);
    const yH_prime = hip.y + (dxH * sinHZ + dyH_forZ * cosHZ);

    const thetaHX_eff = (1 - wH) * thetaThighX;
    const cosHX = Math.cos(thetaHX_eff);
    const sinHX = Math.sin(thetaHX_eff);

    const dyHX = yH_prime - hip.y;
    const dzHX = zK_prime - hip.z;
    const yFinal = hip.y + (dyHX * cosHX - dzHX * sinHX);
    const zFinal = hip.z + (dyHX * sinHX + dzHX * cosHX);

    arr[idx] = xH_prime;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

/**
 * Universal dispatcher to deform any bridging mesh across its anchored kinematic joints.
 */
export function deformBridgingMesh(
  mesh: THREE.Mesh,
  rotations: KinematicPivotRotations,
): void {
  if (isPsoasMesh(mesh)) {
    deformBridgingPsoasMesh(
      mesh,
      rotations.thighRotationX,
      rotations.spineRotationX,
      rotations.thighRotationZ ?? 0,
    );
  } else if (isPlantarisMesh(mesh)) {
    deformBridgingPlantarisMesh(
      mesh,
      rotations.thighRotationX,
      rotations.shinRotationX,
      rotations.thighRotationZ ?? 0,
    );
  } else if (isTransversusAbdominisMesh(mesh)) {
    deformBridgingTransversusAbdominisMesh(mesh, rotations.spineRotationX);
  } else if (isFasciaLataMesh(mesh)) {
    deformBridgingFasciaLataMesh(
      mesh,
      rotations.thighRotationX,
      rotations.shinRotationX,
      rotations.thighRotationZ ?? 0,
    );
  } else if (isBrachioradialisMesh(mesh)) {
    deformBridgingBrachioradialisMesh(
      mesh,
      rotations.forearmRotationX,
      rotations.armRotationZ,
      rotations.armRotationX ?? 0,
      rotations.spineRotationX,
    );
  } else if (isBicepsBrachiiMesh(mesh)) {
    deformBridgingBicepsBrachiiMesh(
      mesh,
      rotations.forearmRotationX,
      rotations.armRotationZ,
      rotations.armRotationX ?? 0,
      rotations.spineRotationX,
    );
  } else if (isQuadricepsMesh(mesh)) {
    deformBridgingQuadricepsMesh(
      mesh,
      rotations.thighRotationX,
      rotations.shinRotationX,
      rotations.thighRotationZ ?? 0,
    );
  } else if (isSartoriusMesh(mesh)) {
    deformBridgingSartoriusMesh(
      mesh,
      rotations.thighRotationX,
      rotations.shinRotationX,
      rotations.thighRotationZ ?? 0,
    );
  } else if (isHamstringsMesh(mesh)) {
    deformBridgingHamstringsMesh(
      mesh,
      rotations.thighRotationX,
      rotations.shinRotationX,
      rotations.thighRotationZ ?? 0,
    );
  } else if (isGracilisMesh(mesh)) {
    deformBridgingGracilisMesh(
      mesh,
      rotations.thighRotationX,
      rotations.shinRotationX,
      rotations.thighRotationZ ?? 0,
    );
  } else if (isBrachialisMesh(mesh)) {
    deformBridgingBrachialisMesh(
      mesh,
      rotations.forearmRotationX,
      rotations.armRotationZ,
      rotations.armRotationX ?? 0,
      rotations.spineRotationX,
    );
  } else if (isExtensorCarpiRadialisMesh(mesh)) {
    deformBridgingExtensorCarpiRadialisMesh(
      mesh,
      rotations.forearmRotationX,
      rotations.armRotationZ,
      rotations.armRotationX ?? 0,
      rotations.spineRotationX,
    );
  } else if (isGastrocnemiusMesh(mesh)) {
    deformBridgingGastrocnemiusMesh(
      mesh,
      rotations.thighRotationX,
      rotations.shinRotationX,
      rotations.thighRotationZ ?? 0,
    );
  } else if (isDeltoidMesh(mesh)) {
    deformBridgingDeltoidMesh(
      mesh,
      rotations.armRotationZ,
      rotations.armRotationX ?? 0,
      rotations.spineRotationX,
    );
  } else if (isPectoralisMajorMesh(mesh)) {
    deformBridgingPectoralisMajorMesh(
      mesh,
      rotations.armRotationZ,
      rotations.armRotationX ?? 0,
      rotations.spineRotationX,
    );
  } else if (isLatissimusDorsiMesh(mesh)) {
    deformBridgingLatissimusDorsiMesh(
      mesh,
      rotations.armRotationZ,
      rotations.armRotationX ?? 0,
      rotations.spineRotationX,
    );
  } else if (isTeresMajorMesh(mesh)) {
    deformBridgingTeresMajorMesh(
      mesh,
      rotations.armRotationZ,
      rotations.armRotationX ?? 0,
      rotations.spineRotationX,
    );
  } else if (isErectorSpinaeMesh(mesh)) {
    deformBridgingErectorSpinaeMesh(mesh, rotations.spineRotationX);
  } else if (isExternalObliqueMesh(mesh)) {
    deformBridgingExternalObliqueMesh(mesh, rotations.spineRotationX);
  } else if (isInternalObliqueMesh(mesh)) {
    deformBridgingInternalObliqueMesh(mesh, rotations.spineRotationX);
  } else if (isLineaAlbaMesh(mesh)) {
    deformBridgingLineaAlbaMesh(mesh, rotations.spineRotationX);
  } else if (isRectusAbdominisMesh(mesh)) {
    deformBridgingRectusAbdominisMesh(mesh, rotations.spineRotationX);
  } else if (isQuadratusLumborumMesh(mesh)) {
    deformBridgingQuadratusLumborumMesh(mesh, rotations.spineRotationX);
  } else if (isLumbarSpineMesh(mesh)) {
    deformBridgingLumbarSpineMesh(mesh, rotations.spineRotationX);
  }
}

export function isBrachialisMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isInsertOrOrigin =
    mesh.name === 'atlas_brachialis_anterior_muscle_humeral_i_5bacb069' ||
    mesh.name === 'atlas_brachialis_muscle_ulnar_insertion_r_ee7c1b98' ||
    text.includes('coracobrachialis') ||
    text.includes('humeral_i') ||
    text.includes('ulnar_insert');
  return (
    (mesh.name === 'muscle_brachialis' ||
      text === 'brachialis' ||
      (text.includes('brachialis') && !text.includes('coracobrachialis'))) &&
    !isInsertOrOrigin
  );
}

/**
 * Deforms the dual-anchored Brachialis muscle mesh across the anterior elbow joint between
 * the mid-distal humerus (arm) and the coronoid process / tuberosity of the ulna (forearm).
 * Hugs the anterior elbow joint capsule and deep surface of biceps brachii, shortening and
 * squashing without detaching from bone.
 */
export function deformBridgingBrachialisMesh(
  mesh: THREE.Mesh,
  thetaForearmX: number,
  thetaArmZ: number = 0,
  thetaArmX: number = 0,
  thetaSpineX: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosFE = Math.cos(thetaForearmX);
  const sinFE = Math.sin(thetaForearmX);

  const cosAZ = Math.cos(thetaArmZ);
  const sinAZ = Math.sin(thetaArmZ);
  const cosAX = Math.cos(thetaArmX);
  const sinAX = Math.sin(thetaArmX);

  const cosS = Math.cos(thetaSpineX);
  const sinS = Math.sin(thetaSpineX);

  const elbow = KINEMATIC_PIVOTS.elbow;
  const shoulder = KINEMATIC_PIVOTS.shoulder;
  const spine = KINEMATIC_PIVOTS.spine;

  const thetaFlex = Math.max(0, -thetaForearmX);
  const sinFlex = Math.sin(thetaFlex);

  // Reference displacement of ulnar insertion (y0 ≈ 1.060, z0 ≈ -0.030) around elbow pivot
  const dyIns = 1.060 - elbow.y;
  const dzIns = -0.030 - elbow.z;
  const yInsFE = elbow.y + (dyIns * cosFE - dzIns * sinFE);
  const zInsFE = elbow.z + (dyIns * sinFE + dzIns * cosFE);
  const deltaYIns = yInsFE - 1.060;
  const deltaZIns = zInsFE - (-0.030);

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    let u = (1.200 - y0) / (1.200 - 1.060);
    if (u < 0) u = 0;
    if (u > 1) u = 1;
    const w = u * u * (3 - 2 * u);

    let xMid = x0;
    let yMid = y0;
    let zMid = z0;

    if (y0 <= 1.074) {
      // Distal ulnar insertion strictly follows forearm rotation around elbow pivot
      const dyE = y0 - elbow.y;
      const dzE = z0 - elbow.z;
      yMid = elbow.y + (dyE * cosFE - dzE * sinFE);
      zMid = elbow.z + (dyE * sinFE + dzE * cosFE);
    } else {
      yMid = y0 + w * deltaYIns;
      zMid = z0 + w * deltaZIns;

      // Natural squash & thickening (stays close to humerus and joint capsule)
      if (thetaFlex > 0 && u > 0 && u < 1) {
        const b = Math.sin(Math.PI * u);
        zMid += 0.009 * sinFlex * b;
        xMid += 0.006 * sinFlex * b * (x0 >= 0 ? 1 : -1);
      }
    }

    // 4. Shoulder transform (Three.js Euler 'XYZ': Z abduction first, then X flexion second)
    const dxS = xMid - shoulder.x;
    const dyS = yMid - shoulder.y;
    const dzS = zMid - shoulder.z;

    const xSZ = dxS * cosAZ - dyS * sinAZ;
    const ySZ = dxS * sinAZ + dyS * cosAZ;
    const zSZ = dzS;

    const xArm = shoulder.x + xSZ;
    const yArm = shoulder.y + (ySZ * cosAX - zSZ * sinAX);
    const zArm = shoulder.z + (ySZ * sinAX + zSZ * cosAX);

    // 5. Spine transform (Spine flexion around spine pivot)
    const dySp = yArm - spine.y;
    const dzSp = zArm - spine.z;
    const yFinal = spine.y + (dySp * cosS - dzSp * sinS);
    const zFinal = spine.z + (dySp * sinS + dzSp * cosS);

    arr[idx] = xArm;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isExtensorCarpiRadialisMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    mesh.name === 'muscle_extensor_carpi_radialis' ||
    text === 'extensor carpi radialis longus' ||
    text.includes('extensor_carpi_radialis_longus') ||
    text.includes('extensor carpi radialis longus') ||
    (text.includes('extensor_carpi_radialis') && !text.includes('brevis'))
  );
}

/**
 * Deforms the dual-anchored Extensor carpi radialis longus muscle mesh across the elbow joint
 * between the lateral supracondylar ridge of the humerus (arm, Y >= 1.130) and the forearm (Y <= 0.950).
 * Intermediate vertices smoothly blend across the joint and pull tighter inward during elbow flexion,
 * keeping the muscle bend nestled inside the lateral crook of the elbow joint rather than bowing outward.
 */
export function deformBridgingExtensorCarpiRadialisMesh(
  mesh: THREE.Mesh,
  thetaForearmX: number,
  thetaArmZ: number = 0,
  thetaArmX: number = 0,
  thetaSpineX: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosFE = Math.cos(thetaForearmX);
  const sinFE = Math.sin(thetaForearmX);

  const cosAZ = Math.cos(thetaArmZ);
  const sinAZ = Math.sin(thetaArmZ);
  const cosAX = Math.cos(thetaArmX);
  const sinAX = Math.sin(thetaArmX);

  const cosS = Math.cos(thetaSpineX);
  const sinS = Math.sin(thetaSpineX);

  const elbow = KINEMATIC_PIVOTS.elbow;
  const shoulder = KINEMATIC_PIVOTS.shoulder;
  const spine = KINEMATIC_PIVOTS.spine;

  const thetaFlex = Math.max(0, -thetaForearmX);
  const flexTightness = Math.sin(Math.min(Math.PI / 2, thetaFlex));

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    // 1. Forearm rotation around elbow pivot
    const dyE = y0 - elbow.y;
    const dzE = z0 - elbow.z;
    const yFE = elbow.y + (dyE * cosFE - dzE * sinFE);
    const zFE = elbow.z + (dyE * sinFE + dzE * cosFE);

    // 2. Blend across elbow joint between humerus (arm, y0 >= 1.130) and forearm (y0 <= 0.950)
    let t = (1.130 - y0) / (1.130 - 0.950);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let xMid = x0;
    let yMid = (1 - w) * y0 + w * yFE;
    let zMid = (1 - w) * z0 + w * zFE;

    // 3. Pull tighter across the elbow joint during flexion to keep the bend inside the joint
    if (thetaFlex > 0 && t > 0 && t < 1) {
      const b = Math.sin(Math.PI * t);
      // Pull inward (medially) and deeper into the crook of the elbow joint
      xMid -= 0.015 * flexTightness * b * (x0 >= 0 ? 1 : -1);
      zMid -= 0.011 * flexTightness * b;
    }

    // 4. Shoulder transform (Three.js Euler 'XYZ': Z abduction first, then X flexion second)
    const dxS = xMid - shoulder.x;
    const dyS = yMid - shoulder.y;
    const dzS = zMid - shoulder.z;

    const xSZ = dxS * cosAZ - dyS * sinAZ;
    const ySZ = dxS * sinAZ + dyS * cosAZ;
    const zSZ = dzS;

    const xArm = shoulder.x + xSZ;
    const yArm = shoulder.y + (ySZ * cosAX - zSZ * sinAX);
    const zArm = shoulder.z + (ySZ * sinAX + zSZ * cosAX);

    // 5. Spine transform (Spine flexion around spine pivot)
    const dySp = yArm - spine.y;
    const dzSp = zArm - spine.z;
    const yFinal = spine.y + (dySp * cosS - dzSp * sinS);
    const zFinal = spine.z + (dySp * sinS + dzSp * cosS);

    arr[idx] = xArm;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isGastrocnemiusMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isOrigin =
    mesh.name.startsWith('atlas_lateral_head_of_gastrocnemius') ||
    mesh.name.startsWith('atlas_medial_head_of_gastrocnemius') ||
    text.includes('head of gastrocnemius on') ||
    text.includes('gastrocnemius_on_lat') ||
    text.includes('gastrocnemius_on_med');
  return (
    (mesh.name === 'muscle_gastrocnemius' ||
      text === 'gastrocnemius' ||
      text.includes('gastrocnemius')) &&
    !isOrigin
  );
}

/**
 * Deforms the dual-anchored Gastrocnemius muscle mesh across the knee joint between
 * the posterior lateral and medial femoral condyles (thigh, Y >= 0.470) and the calcaneal tendon (shin, Y <= 0.410).
 * As the knee flexes, the distance between the femoral condyles and posterior shin shortens,
 * causing the calf bellies to squash along length and bulge posteriorly into negative Z.
 */
export function deformBridgingGastrocnemiusMesh(
  mesh: THREE.Mesh,
  thetaThighX: number,
  thetaShinX: number,
  thetaThighZ: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const cosK = Math.cos(thetaShinX);
  const sinK = Math.sin(thetaShinX);
  const cosH = Math.cos(thetaThighX);
  const sinH = Math.sin(thetaThighX);
  const cosHZ = Math.cos(thetaThighZ);
  const sinHZ = Math.sin(thetaThighZ);

  const knee = KINEMATIC_PIVOTS.knee;
  const hip = KINEMATIC_PIVOTS.hip;
  const sinKnee = Math.sin(Math.max(0, thetaShinX));

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    let x0 = orig[idx];
    const y0 = orig[idx + 1];
    let z0 = orig[idx + 2];

    // Squash & stretch (posterior calf belly bulge during knee flexion)
    let tBelly = (y0 - 0.260) / (0.450 - 0.260);
    if (sinKnee > 0 && tBelly > 0 && tBelly < 1) {
      const b = Math.sin(Math.PI * tBelly);
      z0 -= 0.016 * sinKnee * b;
      x0 += 0.008 * sinKnee * b * ((x0 - hip.x) / 0.04);
    }

    // --- 1. Thigh transform around hip pivot (Three.js Euler 'XYZ': Z first, then X) ---
    const dxH = x0 - hip.x;
    const dyH = y0 - hip.y;
    const dzH = z0 - hip.z;

    const xThigh_Z = dxH * cosHZ - dyH * sinHZ;
    const yThigh_Z = dxH * sinHZ + dyH * cosHZ;
    const zThigh_Z = dzH;

    const xThigh = hip.x + xThigh_Z;
    const yThigh = hip.y + (yThigh_Z * cosH - zThigh_Z * sinH);
    const zThigh = hip.z + (yThigh_Z * sinH + zThigh_Z * cosH);

    // --- 2. Shin transform: knee pivot followed by hip pivot (Z first, then X) ---
    const dyK = y0 - knee.y;
    const dzK = z0 - knee.z;
    const yK = knee.y + (dyK * cosK - dzK * sinK);
    const zK = knee.z + (dyK * sinK + dzK * cosK);

    const dxShin_H = x0 - hip.x;
    const dyShin_H = yK - hip.y;
    const dzShin_H = zK - hip.z;

    const xShin_Z = dxShin_H * cosHZ - dyShin_H * sinHZ;
    const yShin_Z = dxShin_H * sinHZ + dyShin_H * cosHZ;
    const zShin_Z = dzShin_H;

    const xShin = hip.x + xShin_Z;
    const yShin = hip.y + (yShin_Z * cosH - zShin_Z * sinH);
    const zShin = hip.z + (yShin_Z * sinH + zShin_Z * cosH);

    // --- 3. Smooth blend across knee joint ---
    // Smooth weight between shin (w = 1 at y0 <= 0.410) and femur condyles (w = 0 at y0 >= 0.475)
    let t = (0.475 - y0) / (0.475 - 0.410);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const wShin = t * t * (3 - 2 * t);
    const wThigh = 1 - wShin;

    arr[idx] = wThigh * xThigh + wShin * xShin;
    arr[idx + 1] = wThigh * yThigh + wShin * yShin;
    arr[idx + 2] = wThigh * zThigh + wShin * zShin;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isDeltoidMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isLandmark =
    mesh.name.startsWith('atlas_acromial_head_of_deltoid') ||
    mesh.name.startsWith('atlas_clavicular_part_of_deltoid') ||
    mesh.name.startsWith('atlas_deltoid_muscle_humeral_insertion') ||
    mesh.name.startsWith('atlas_scapular_head_of_deltoid') ||
    text.includes('deltoid_muscle_humeral') ||
    text.includes('deltoid muscle-humeral insertion') ||
    text.includes('deltoid muscle-scapular insertion') ||
    text.includes('deltoid muscle-clavicular insertion');
  if (isLandmark) return false;

  return (
    mesh.name === 'muscle_deltoid_anterior' ||
    mesh.name === 'muscle_deltoid_lateral' ||
    mesh.name === 'muscle_deltoid_posterior' ||
    text.includes('deltoid')
  );
}

/**
 * Deforms the Deltoid muscle group (Anterior, Lateral, and Posterior heads)
 * across 2-axis shoulder rotations (abduction thetaArmZ, flexion/extension thetaArmX)
 * and torso pitch (thetaSpineX).
 *
 * Kinematic Architecture:
 * 1. Mostly Rigid Arc Motion: The muscle body slides up and inward around a smooth
 *    circular arc over the shoulder dome as the arm abducts, lifting the apex and
 *    centering smoothly over the joint without soft-tissue inward collapse or creasing.
 * 2. Pure Spatial Translation at Humeral Insertion: Vertices anchoring to the humerus
 *    (deltoid tuberosity, Y <= 1.280) follow the spatial translation of the humerus without
 *    local rotational twisting or shear.
 * 3. Smooth Minimalist Blending: A clean, constraint-free vertical transition connects the
 *    pure humeral translation at the tendon to the rigid arc sliding of the belly and apex.
 */
export function deformBridgingDeltoidMesh(
  mesh: THREE.Mesh,
  thetaArmZ: number,
  thetaArmX: number = 0,
  thetaSpineX: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const shoulder = KINEMATIC_PIVOTS.shoulder;
  const spine = KINEMATIC_PIVOTS.spine;

  const cosAX = Math.cos(thetaArmX);
  const sinAX = Math.sin(thetaArmX);

  const cosS = Math.cos(thetaSpineX);
  const sinS = Math.sin(thetaSpineX);

  const abductAngle = Math.max(0, thetaArmZ);
  const normAbduct = Math.min(1, abductAngle / (Math.PI / 2));
  // Active contraction factor: aggressively ramps as the arm raises to power abduction
  const contract = Math.sin(Math.min(Math.PI / 2, normAbduct * 1.5));

  // Calibrated upward flex lift:
  // Provides a subtle, natural crest lift (up to ~3.5 cm) without bulging upward too high into the air.
  const arcDy = 0.035 * Math.sin(normAbduct * (Math.PI / 2));

  // Flexion/extension trigonometric components for forward/backward arm swing
  // (Pure rotation around shoulder pivot without artificial girdle translation)
  // Origins on clavicle, acromion, and scapular spine functionally anchor to the torso;
  // muscle fibers stretch and twist toward the moving humeral insertion.
  const cZPos = Math.cos(thetaArmZ);
  const sZPos = Math.sin(thetaArmZ);
  const cZNeg = Math.cos(-thetaArmZ);
  const sZNeg = Math.sin(-thetaArmZ);

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const absX = Math.abs(x0);
    const signX = x0 < 0 ? -1 : 1;

    // Exact rigid arm displacement components at this vertex:
    const sX = signX * shoulder.x;
    const cZ = signX < 0 ? cZNeg : cZPos;
    const sZ = signX < 0 ? sZNeg : sZPos;

    const dx = x0 - sX;
    const dy = y0 - shoulder.y;
    const dz = z0 - shoulder.z;

    const xSZ = dx * cZ - dy * sZ;
    const ySZ = dx * sZ + dy * cZ;
    const zSZ = dz;

    // Abduction displacement (rotation around Z):
    const armDispX = (sX + xSZ) - x0;
    const armDispY_abduct = (shoulder.y + ySZ) - y0;

    // Forward/back rotation displacement (rotation around X):
    const deltaY_flex = ySZ * (cosAX - 1) - zSZ * sinAX;
    const deltaZ_flex = ySZ * sinAX + zSZ * (cosAX - 1);

    // 1. Innermost corner pinning:
    // Vertices at the medial attachment origins (|X| <= 0.105) along the clavicle and
    // scapular spine remain strictly pinned to the skeleton (wMobile = 0).
    // Mobility transitions smoothly to the mobile muscle body by |X| = 0.140.
    let tPin = (absX - 0.105) / (0.140 - 0.105);
    if (tPin < 0) tPin = 0;
    if (tPin > 1) tPin = 1;
    const wMobile = tPin * tPin * (3 - 2 * tPin);

    // 2. Vertical transition for abduction contraction:
    // Vertices on the humerus shaft (y0 <= 1.350) maintain outward tracking to prevent bone clipping.
    // The upper shoulder girdle (y0 >= 1.405) contracts horizontally and vertically.
    let tGirdle = (y0 - 1.350) / (1.405 - 1.350);
    if (tGirdle < 0) tGirdle = 0;
    if (tGirdle > 1) tGirdle = 1;
    const sGirdle = tGirdle * tGirdle * (3 - 2 * tGirdle);
    const sArm = 1 - sGirdle;

    // 3. Forward/back rotation along muscle fibers:
    // The entire inner part / origin along the clavicle, acromion, and scapular spine
    // is functionally attached to the torso (wFlex = 0), only stretching and twisting
    // toward the humeral insertion (y0 <= 1.288) which follows the arm (wFlex = 1).
    const yOrig = 1.415 + Math.min(0, (z0 + 0.040) * 0.70);
    let tFlex = (yOrig - y0) / (yOrig - 1.288);
    if (tFlex < 0) tFlex = 0;
    if (tFlex > 1) tFlex = 1;
    const wFlex = tFlex * tFlex * (3 - 2 * tFlex);

    // 4. Horizontal contraction across shoulder girdle:
    // Shrinking is applied predominantly toward the outer side of the deltoid (|X| > 0.170)
    // to pull the wide lateral flank inward while keeping the apex centered above the bone
    // (acromion / greater tubercle). Medial fibers (|X| <= 0.170) maintain gentle tension.
    const innerSpan = Math.max(0, absX - 0.105);
    const outerSpan = Math.max(0, absX - 0.170);
    const shrinkX = (innerSpan * 0.06 + outerSpan * 0.50) * contract;

    // 5. Vertical contraction towards joint center:
    // Shortens the muscle belly vertically towards the joint center (Y = 1.378)
    // to model realistic muscular shortening and prevent upward bulging.
    const vertSpan = y0 - shoulder.y;
    const shrinkY = vertSpan * 0.35 * contract;

    // Blended displacement:
    // - Lower half tracks outward humerus translation to prevent bone clipping during abduction.
    // - Forward/back rotation is anchored to the torso at the origin (wFlex = 0) and tracks humerus at insertion (wFlex = 1),
    //   producing natural fiber stretching and twisting without displacing the torso attachment.
    // - Upper girdle contracts inward and shortens vertically over the joint during abduction.
    const dispX = wMobile * (sArm * armDispX - sGirdle * (signX * shrinkX));
    const dispY = wMobile * (sArm * armDispY_abduct + wFlex * deltaY_flex + sGirdle * (arcDy - shrinkY));
    const dispZ = wMobile * (wFlex * deltaZ_flex);

    const xMid = x0 + dispX;
    const yMid = y0 + dispY;
    const zMid = z0 + dispZ;

    // Spine transform around spine pivot (pitch around X)
    const dySp = yMid - spine.y;
    const dzSp = zMid - spine.z;
    const yFinal = spine.y + (dySp * cosS - dzSp * sinS);
    const zFinal = spine.z + (dySp * sinS + dzSp * cosS);

    arr[idx] = xMid;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isPectoralisMajorMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isLandmark =
    mesh.name.startsWith('atlas_pectoralis_major_muscle_clavicular_i') ||
    mesh.name.startsWith('atlas_pectoralis_major_muscle_humeral_inse') ||
    text.includes('pectoralis_major_muscle_humeral') ||
    text.includes('pectoralis_major_muscle_clavicular') ||
    text.includes('pectoralis major muscle-clavicular insertion') ||
    text.includes('pectoralis major muscle-humeral insertion');
  if (isLandmark) return false;

  if (text.includes('minor')) return false;

  return (
    mesh.name === 'muscle_pectoralis_major' ||
    text === 'pectoralis major' ||
    text.includes('pectoralis_major') ||
    text.includes('pectoralis major') ||
    (text.includes('pectoralis') && !text.includes('minor'))
  );
}

/**
 * Deforms the dual-anchored Pectoralis major muscle across compound 2-axis shoulder rotations
 * (abduction/adduction thetaArmZ, flexion/extension thetaArmX).
 *
 * Anatomical & Kinematic Constraints:
 * 1. Translation-only insertion: vertices attaching to the humerus translate with the humeral insertion
 *    displacement (delta_T_ins) rather than rotating locally, preventing twisting, flipping, or tearing.
 * 2. Lower edge constraint: all vertices along the inferior / abdominal border (Y <= 1.240, costal margin
 *    and rectus sheath) remain 100% pinned to the chest wall.
 * 3. Medial chest constraint: the majority of the muscle across the sternum and medial clavicle
 *    (x_abs <= 0.115) remains 100% pinned to the torso (spine).
 * 4. Upper-lateral fibers smoothly and mildly stretch toward the translated humeral tendon.
 */
export function deformBridgingPectoralisMajorMesh(
  mesh: THREE.Mesh,
  thetaArmZ: number,
  thetaArmX: number = 0,
  thetaSpineX: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const shoulder = KINEMATIC_PIVOTS.shoulder;
  const spine = KINEMATIC_PIVOTS.spine;

  const cosAX = Math.cos(thetaArmX);
  const sinAX = Math.sin(thetaArmX);

  const cosS = Math.cos(thetaSpineX);
  const sinS = Math.sin(thetaSpineX);

  const sinFlex = Math.sin(Math.max(0, -thetaArmX));

  // Precompute the pure translation displacement of the humeral insertion landmark
  // for both right (sign = -1) and left (sign = +1) sides
  const calcTendonDelta = (sign: number) => {
    const sX = sign * shoulder.x;
    const effZ = sign * thetaArmZ;
    const cZ = Math.cos(effZ);
    const sZ = Math.sin(effZ);

    const xIns0 = sign * 0.188;
    const yIns0 = 1.326;
    const zIns0 = -0.016;

    const dx = xIns0 - sX;
    const dy = yIns0 - shoulder.y;
    const dz = zIns0 - shoulder.z;

    const xSZ = dx * cZ - dy * sZ;
    const ySZ = dx * sZ + dy * cZ;
    const zSZ = dz;

    const xPrime = sX + xSZ;
    const yPrime = shoulder.y + (ySZ * cosAX - zSZ * sinAX);
    const zPrime = shoulder.z + (ySZ * sinAX + zSZ * cosAX);

    return {
      dx: xPrime - xIns0,
      dy: yPrime - yIns0,
      dz: zPrime - zIns0,
    };
  };

  const deltaPos = calcTendonDelta(1);
  const deltaNeg = calcTendonDelta(-1);

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const delta = x0 < 0 ? deltaNeg : deltaPos;

    // 1. Lower edge constraint:
    // Below Y = 1.240, muscle is 100% pinned to ribs/aponeurosis (wY = 0).
    // Between 1.240 and 1.285, wY smoothly ramps up to 1 toward the axillary fold.
    let fY = (y0 - 1.240) / (1.285 - 1.240);
    if (fY < 0) fY = 0;
    if (fY > 1) fY = 1;
    const wY = fY * fY * (3 - 2 * fY);

    // 2. Medial chest constraint:
    // Medial chest (xabs <= 0.115) and clavicle (xabs <= 0.105) are 100% pinned to chest wall (wX = 0).
    // Only lateral fibers heading to the armpit and humerus (xabs >= 0.115 to 0.170) stretch.
    const xabs = Math.abs(x0);
    let tX = (xabs - 0.115) / (0.170 - 0.115);
    if (tX < 0) tX = 0;
    if (tX > 1) tX = 1;
    const wX = tX * tX * (3 - 2 * tX);

    // Combined influence: only lateral AND upper fibers move with the humeral insertion
    const w = wX * wY;

    // Translation only (no rotation of the vertices)
    let xMid = x0 + w * delta.dx;
    let yMid = y0 + w * delta.dy;
    let zMid = z0 + w * delta.dz;

    // Mild anterior bulge during forward flexion / horizontal adduction
    if (w > 0 && w < 1 && sinFlex > 0) {
      const b = Math.sin(Math.PI * w);
      zMid += 0.008 * sinFlex * b;
    }

    // Spine transform around spine pivot
    const dySp = yMid - spine.y;
    const dzSp = zMid - spine.z;
    const yFinal = spine.y + (dySp * cosS - dzSp * sinS);
    const zFinal = spine.z + (dySp * sinS + dzSp * cosS);

    arr[idx] = xMid;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isLatissimusDorsiMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isLandmark =
    mesh.name.startsWith('atlas_latissimus_dorsi_iliac_insertion') ||
    mesh.name.startsWith('atlas_latissimus_dorsi_on_apex_of_the_scap') ||
    text.includes('latissimus_dorsi_iliac') ||
    text.includes('latissimus_dorsi_on_apex') ||
    text.includes('latissimus dorsi-iliac') ||
    text.includes('latissimus dorsi on apex');
  if (isLandmark) return false;

  return (
    mesh.name === 'muscle_latissimus_dorsi' ||
    text === 'latissimus dorsi' ||
    text.includes('latissimus_dorsi') ||
    text.includes('latissimus dorsi') ||
    text.includes('latissimus')
  );
}

/**
 * Deforms the fan-shaped Latissimus dorsi muscle across 2-axis shoulder rotations
 * (abduction thetaArmZ, flexion/extension thetaArmX) and torso pitch (thetaSpineX).
 *
 * Anatomical & Kinematic Architecture:
 * 1. Broad torso anchor: Origin across thoracic/lumbar spine, iliac crest, and ribs
 *    (Y <= 1.200 or |X| <= 0.115) remains 100% attached to the torso skeleton.
 * 2. Humeral tendon: The upper lateral fibers converge into the tendon inserting into
 *    the intertubercular groove of the humerus (Y >= 1.330, |X| >= 0.170), tracking the humerus.
 * 3. Smooth transitional fan: As the arm abducts or flexes, the axillary fibers stretch
 *    smoothly to accommodate the arm's movements without tearing or collapsing.
 */
export function deformBridgingLatissimusDorsiMesh(
  mesh: THREE.Mesh,
  thetaArmZ: number,
  thetaArmX: number = 0,
  thetaSpineX: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const shoulder = KINEMATIC_PIVOTS.shoulder;
  const spine = KINEMATIC_PIVOTS.spine;

  const cosAX = Math.cos(thetaArmX);
  const sinAX = Math.sin(thetaArmX);

  const cosS = Math.cos(thetaSpineX);
  const sinS = Math.sin(thetaSpineX);

  const calcTendonDelta = (sign: number) => {
    const sX = sign * shoulder.x;
    const effZ = sign * thetaArmZ;
    const cZ = Math.cos(effZ);
    const sZ = Math.sin(effZ);

    const xIns0 = sign * 0.175;
    const yIns0 = 1.331;
    const zIns0 = -0.024;

    const dx = xIns0 - sX;
    const dy = yIns0 - shoulder.y;
    const dz = zIns0 - shoulder.z;

    const xSZ = dx * cZ - dy * sZ;
    const ySZ = dx * sZ + dy * cZ;
    const zSZ = dz;

    const xPrime = sX + xSZ;
    const yPrime = shoulder.y + (ySZ * cosAX - zSZ * sinAX);
    const zPrime = shoulder.z + (ySZ * sinAX + zSZ * cosAX);

    return {
      dx: xPrime - xIns0,
      dy: yPrime - yIns0,
      dz: zPrime - zIns0,
    };
  };

  const deltaPos = calcTendonDelta(1);
  const deltaNeg = calcTendonDelta(-1);

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const absX = Math.abs(x0);
    const delta = x0 < 0 ? deltaNeg : deltaPos;

    // 1. Lower back constraint: Below Y = 1.200, 100% attached to torso (wY = 0)
    let tY = (y0 - 1.200) / (1.330 - 1.200);
    if (tY < 0) tY = 0;
    if (tY > 1) tY = 1;
    const wY = tY * tY * (3 - 2 * tY);

    // 2. Medial back constraint: Medial back (|X| <= 0.115) 100% on torso (wX = 0)
    let tX = (absX - 0.115) / (0.170 - 0.115);
    if (tX < 0) tX = 0;
    if (tX > 1) tX = 1;
    const wX = tX * tX * (3 - 2 * tX);

    const w = wX * wY;

    const xMid = x0 + w * delta.dx;
    const yMid = y0 + w * delta.dy;
    const zMid = z0 + w * delta.dz;

    // Spine transform around spine pivot
    const dySp = yMid - spine.y;
    const dzSp = zMid - spine.z;
    const yFinal = spine.y + (dySp * cosS - dzSp * sinS);
    const zFinal = spine.z + (dySp * sinS + dzSp * cosS);

    arr[idx] = xMid;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isTeresMajorMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  if (text.includes('minor')) return false;
  if (text.includes('pronator')) return false;

  const isLandmark =
    mesh.name.startsWith('atlas_teres_major_muscle_humeral_insertion') ||
    mesh.name.startsWith('atlas_teres_major_muscle_scapular_insertio') ||
    text.includes('teres_major_muscle_humeral') ||
    text.includes('teres_major_muscle_scapular') ||
    text.includes('teres major muscle-humeral insertion') ||
    text.includes('teres major muscle-scapular insertion');
  if (isLandmark) return false;

  return (
    mesh.name === 'muscle_teres_major' ||
    text === 'teres major' ||
    text.includes('teres_major') ||
    text.includes('teres major')
  );
}

/**
 * Deforms Teres major from its scapular origin (inferior angle) to its humeral insertion
 * (medial lip of intertubercular groove) across 2-axis shoulder rotations and torso pitch.
 *
 * Anatomical & Kinematic Architecture:
 * 1. Scapular origin: Remains anchored to the inferior angle of the scapula on the torso.
 * 2. Humeral insertion: Upper end follows the humerus rotation in space.
 * 3. Directional stretch: The muscle belly smoothly stretches along its line of action.
 */
export function deformBridgingTeresMajorMesh(
  mesh: THREE.Mesh,
  thetaArmZ: number,
  thetaArmX: number = 0,
  thetaSpineX: number = 0,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;

  const shoulder = KINEMATIC_PIVOTS.shoulder;
  const spine = KINEMATIC_PIVOTS.spine;

  const cosAX = Math.cos(thetaArmX);
  const sinAX = Math.sin(thetaArmX);

  const cosS = Math.cos(thetaSpineX);
  const sinS = Math.sin(thetaSpineX);

  const calcTendonDelta = (sign: number) => {
    const sX = sign * shoulder.x;
    const effZ = sign * thetaArmZ;
    const cZ = Math.cos(effZ);
    const sZ = Math.sin(effZ);

    const xIns0 = sign * 0.174;
    const yIns0 = 1.332;
    const zIns0 = -0.024;

    const dx = xIns0 - sX;
    const dy = yIns0 - shoulder.y;
    const dz = zIns0 - shoulder.z;

    const xSZ = dx * cZ - dy * sZ;
    const ySZ = dx * sZ + dy * cZ;
    const zSZ = dz;

    const xPrime = sX + xSZ;
    const yPrime = shoulder.y + (ySZ * cosAX - zSZ * sinAX);
    const zPrime = shoulder.z + (ySZ * sinAX + zSZ * cosAX);

    return {
      dx: xPrime - xIns0,
      dy: yPrime - yIns0,
      dz: zPrime - zIns0,
    };
  };

  const deltaPos = calcTendonDelta(1);
  const deltaNeg = calcTendonDelta(-1);

  // Muscle axis vector from scapular origin (0.105, 1.265, -0.092) to humerus (0.174, 1.332, -0.024)
  const vx = 0.069;
  const vy = 0.067;
  const vz = 0.068;
  const vSq = vx * vx + vy * vy + vz * vz;

  const arr = posAttr.array as Float32Array;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const absX = Math.abs(x0);
    const delta = x0 < 0 ? deltaNeg : deltaPos;

    // Projection along muscle axis from origin (scapula) to insertion (humerus)
    const dx = absX - 0.105;
    const dy = y0 - 1.265;
    const dz = z0 - (-0.092);

    let u = (dx * vx + dy * vy + dz * vz) / vSq;
    if (u < 0) u = 0;
    if (u > 1) u = 1;
    const w = u * u * (3 - 2 * u);

    const xMid = x0 + w * delta.dx;
    const yMid = y0 + w * delta.dy;
    const zMid = z0 + w * delta.dz;

    // Spine transform around spine pivot
    const dySp = yMid - spine.y;
    const dzSp = zMid - spine.z;
    const yFinal = spine.y + (dySp * cosS - dzSp * sinS);
    const zFinal = spine.z + (dySp * sinS + dzSp * cosS);

    arr[idx] = xMid;
    arr[idx + 1] = yFinal;
    arr[idx + 2] = zFinal;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isErectorSpinaeMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isIliac =
    mesh.name === 'atlas_erector_spinae_muscles_iliac_inserti_bfc50f21' ||
    text.includes('erector_spinae_muscles_iliac') ||
    text.includes('erector spinae muscles-iliac');
  return (
    !isIliac &&
    (mesh.name === 'muscle_erector_spinae' ||
      mesh.name === 'atlas_longissimus_thoracis_r_9a6c4246' ||
      text.includes('erector_spinae') ||
      text.includes('erector spinae') ||
      text.includes('longissimus_thoracis') ||
      text.includes('longissimus thoracis') ||
      text.includes('iliocostalis_lumborum') ||
      text.includes('iliocostalis lumborum') ||
      text.includes('sacrospinalis') ||
      (text.includes('erector') && text.includes('spinae')))
  );
}

/**
 * Deforms the Erector spinae group (including longissimus thoracis, iliocostalis) spanning the torso bend.
 *
 * Lower vertices (Y <= 0.96) attach to the posterior iliac crest, sacrum, and lower lumbar spines,
 * remaining strictly anchored to the pelvis (displacement = 0).
 * Upper vertices (Y >= 1.15) rotate rigidly with the thoracic spine and ribcage.
 *
 * Intermediate vertices smoothly interpolate:
 * - During torso flexion (thetaSpine > 0): the posterior column stretches over the flexion curve,
 *   pulling taut against the lumbar vertebrae to prevent protrusion.
 * - During torso extension (thetaSpine < 0): the erector spinae shortens and contracts, squashing
 *   and bulging posteriorly (in -Z) and widening laterally (+/-X) to form muscular spinal columns.
 */
export function deformBridgingErectorSpinaeMesh(
  mesh: THREE.Mesh,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;
  const arr = posAttr.array as Float32Array;

  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);
  const spine = KINEMATIC_PIVOTS.spine;

  const yBot = 0.96;
  const yTop = 1.15;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    let t = (y0 - yBot) / (yTop - yBot);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let x = x0;
    let y = (1 - w) * y0 + w * ySpine;
    let z = (1 - w) * z0 + w * zSpine;

    if (thetaSpine !== 0 && t > 0 && t < 1) {
      const b = Math.sin(Math.PI * t);
      if (thetaSpine < 0) {
        // Torso extension: active contraction, squashing, posterior bulge in -Z and lateral widening
        const extFactor = -sinS;
        z -= 0.032 * extFactor * b;
        x += 0.045 * extFactor * b * x0;
      } else {
        // Torso flexion: passive stretch, drawing taut against lumbar curve
        const flexFactor = sinS;
        z += 0.015 * flexFactor * b;
        x -= 0.020 * flexFactor * b * x0;
      }
    }

    arr[idx] = x;
    arr[idx + 1] = y;
    arr[idx + 2] = z;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isExternalObliqueMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isIliac =
    mesh.name === 'atlas_external_abdominal_oblique_muscle_il_ef830ec5' ||
    text.includes('external_abdominal_oblique_muscle_il') ||
    text.includes('external abdominal oblique muscle-iliac');
  return (
    !isIliac &&
    (mesh.name === 'muscle_external_oblique' ||
      text.includes('external_oblique') ||
      text.includes('external oblique') ||
      text.includes('external_abdominal_oblique') ||
      text.includes('external abdominal oblique') ||
      text.includes('obliquus_externus') ||
      text.includes('obliquus externus'))
  );
}

/**
 * Deforms the External oblique muscle mesh across torso flexion and extension.
 *
 * Lower edge attaches along the outer lip of the iliac crest and inguinal ligament to the pubic tubercle,
 * remaining strictly anchored to the pelvis.
 * Upper digitations attach to the lower 8 ribs (ribs 5-12), rotating with the ribcage and spine.
 *
 * Squash & stretch: volume preservation of the abdominal cavity bulges the anterior wall and flanks
 * forward and outward during trunk flexion, while drawing taut during extension.
 */
export function deformBridgingExternalObliqueMesh(
  mesh: THREE.Mesh,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;
  const arr = posAttr.array as Float32Array;

  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);
  const spine = KINEMATIC_PIVOTS.spine;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    // Pelvic contour: iliac crest (Y ≈ 0.98 at Z <= 0.01) to inguinal/pubic crest (Y ≈ 0.91 at Z ≈ 0.11)
    const yBot = 0.98 - 0.70 * Math.max(0, z0 - 0.01);
    const yTop = 1.15;

    let t = (y0 - yBot) / (yTop - yBot);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let x = x0;
    let y = (1 - w) * y0 + w * ySpine;
    let z = (1 - w) * z0 + w * zSpine;

    if (thetaSpine !== 0 && t > 0 && t < 1) {
      const b = Math.sin(Math.PI * t);
      const zFactor = Math.max(0, (z0 - (-0.02)) / 0.12);
      if (thetaSpine > 0) {
        z += 0.038 * sinS * b * zFactor;
        x += 0.070 * sinS * b * zFactor * x0;
      } else {
        z += 0.020 * sinS * b * zFactor;
        x += 0.035 * sinS * b * zFactor * x0;
      }
    }

    arr[idx] = x;
    arr[idx + 1] = y;
    arr[idx + 2] = z;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isInternalObliqueMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  const isIliac =
    mesh.name === 'atlas_internal_abdominal_oblique_muscle_il_45b42876' ||
    text.includes('internal_abdominal_oblique_muscle_il') ||
    text.includes('internal abdominal oblique muscle-iliac');
  return (
    !isIliac &&
    (mesh.name === 'atlas_internal_abdominal_oblique_r_7656165c' ||
      text.includes('internal_abdominal_oblique') ||
      text.includes('internal abdominal oblique') ||
      text.includes('internal_oblique') ||
      text.includes('internal oblique') ||
      text.includes('obliquus_internus') ||
      text.includes('obliquus internus'))
  );
}

/**
 * Deforms the Internal abdominal oblique muscle mesh across torso flexion and extension.
 *
 * Lower edge attaches along the intermediate lip of the iliac crest and lateral inguinal ligament,
 * anchored to the pelvis.
 * Upper insertions attach to the lower ribs (ribs 9-12) and the rectus sheath / linea alba.
 */
export function deformBridgingInternalObliqueMesh(
  mesh: THREE.Mesh,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;
  const arr = posAttr.array as Float32Array;

  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);
  const spine = KINEMATIC_PIVOTS.spine;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    const yBot = 0.98 - 0.70 * Math.max(0, z0 - 0.01);
    const yTop = 1.14;

    let t = (y0 - yBot) / (yTop - yBot);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let x = x0;
    let y = (1 - w) * y0 + w * ySpine;
    let z = (1 - w) * z0 + w * zSpine;

    if (thetaSpine !== 0 && t > 0 && t < 1) {
      const b = Math.sin(Math.PI * t);
      const zFactor = Math.max(0, (z0 - (-0.02)) / 0.12);
      if (thetaSpine > 0) {
        z += 0.036 * sinS * b * zFactor;
        x += 0.065 * sinS * b * zFactor * x0;
      } else {
        z += 0.015 * sinS * b * zFactor;
        x += 0.025 * sinS * b * zFactor * x0;
      }
    }

    arr[idx] = x;
    arr[idx + 1] = y;
    arr[idx + 2] = z;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isLineaAlbaMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    mesh.name === 'atlas_linea_alba_eeb055b3' ||
    text.includes('linea_alba') ||
    text.includes('linea alba')
  );
}

/**
 * Deforms the Linea alba tendonous seam running down the anterior abdominal midline.
 *
 * Inferior attachment: pubic symphysis and pubic crest (Y <= 0.91), anchored to the pelvis.
 * Superior attachment: xiphoid process (Y >= 1.16), following the sternum.
 * Intermediate: bulges anteriorly in +Z during flexion as the rectus abdominis bellies squash.
 */
export function deformBridgingLineaAlbaMesh(
  mesh: THREE.Mesh,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;
  const arr = posAttr.array as Float32Array;

  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);
  const spine = KINEMATIC_PIVOTS.spine;

  const yBot = 0.91;
  const yTop = 1.16;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    let t = (y0 - yBot) / (yTop - yBot);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let y = (1 - w) * y0 + w * ySpine;
    let z = (1 - w) * z0 + w * zSpine;

    if (thetaSpine !== 0 && t > 0 && t < 1) {
      const b = Math.sin(Math.PI * t);
      if (thetaSpine > 0) {
        z += 0.042 * sinS * b;
      } else {
        z += 0.022 * sinS * b;
      }
    }

    arr[idx] = x0;
    arr[idx + 1] = y;
    arr[idx + 2] = z;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isRectusAbdominisMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    mesh.name === 'muscle_rectus_abdominis' ||
    text.includes('rectus_abdominis') ||
    text.includes('rectus abdominis')
  );
}

/**
 * Deforms the Rectus abdominis muscle columns flanking the anterior midline.
 *
 * Inferior origin: pubic crest and pubic tubercle (Y <= 0.91), anchored to the pelvis.
 * Superior insertion: cartilages of ribs 5-7 and xiphoid process (Y >= 1.15), following the ribcage.
 * Intermediate belly: squashes and bulges anteriorly in +Z and slightly laterally in X during flexion,
 * and stretches taut during trunk extension.
 */
export function deformBridgingRectusAbdominisMesh(
  mesh: THREE.Mesh,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;
  const arr = posAttr.array as Float32Array;

  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);
  const spine = KINEMATIC_PIVOTS.spine;

  const yBot = 0.91;
  const yTop = 1.15;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    let t = (y0 - yBot) / (yTop - yBot);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let x = x0;
    let y = (1 - w) * y0 + w * ySpine;
    let z = (1 - w) * z0 + w * zSpine;

    if (thetaSpine !== 0 && t > 0 && t < 1) {
      const b = Math.sin(Math.PI * t);
      if (thetaSpine > 0) {
        z += 0.042 * sinS * b;
        x += 0.045 * sinS * b * x0;
      } else {
        z += 0.022 * sinS * b;
        x += 0.020 * sinS * b * x0;
      }
    }

    arr[idx] = x;
    arr[idx + 1] = y;
    arr[idx + 2] = z;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isQuadratusLumborumMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    mesh.name === 'atlas_quadratus_lumborum_muscle_r_d64800b8' ||
    text.includes('quadratus_lumborum') ||
    text.includes('quadratus lumborum')
  );
}

/**
 * Deforms the Quadratus lumborum muscle spanning the posterior abdominal wall between the iliac crest and 12th rib.
 *
 * Lower edge (Y <= 0.98) anchored to the internal lip of the iliac crest and iliolumbar ligament on the pelvis.
 * Upper edge (Y >= 1.10) attached to the lower border of the 12th rib and L1-L4 transverse processes.
 */
export function deformBridgingQuadratusLumborumMesh(
  mesh: THREE.Mesh,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;
  const arr = posAttr.array as Float32Array;

  const cosS = Math.cos(thetaSpine);
  const sinS = Math.sin(thetaSpine);
  const spine = KINEMATIC_PIVOTS.spine;

  const yBot = 0.98;
  const yTop = 1.10;

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    const dyS = y0 - spine.y;
    const dzS = z0 - spine.z;
    const ySpine = spine.y + (dyS * cosS - dzS * sinS);
    const zSpine = spine.z + (dyS * sinS + dzS * cosS);

    let t = (y0 - yBot) / (yTop - yBot);
    if (t < 0) t = 0;
    if (t > 1) t = 1;
    const w = t * t * (3 - 2 * t);

    let x = x0;
    let y = (1 - w) * y0 + w * ySpine;
    let z = (1 - w) * z0 + w * zSpine;

    if (thetaSpine !== 0 && t > 0 && t < 1) {
      const b = Math.sin(Math.PI * t);
      if (thetaSpine < 0) {
        const extFactor = -sinS;
        z -= 0.025 * extFactor * b;
        x += 0.035 * extFactor * b * x0;
      } else {
        const flexFactor = sinS;
        z += 0.012 * flexFactor * b;
        x -= 0.015 * flexFactor * b * x0;
      }
    }

    arr[idx] = x;
    arr[idx + 1] = y;
    arr[idx + 2] = z;
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function isLumbarSpineMesh(mesh: THREE.Mesh): boolean {
  const text = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
  return (
    mesh.name === 'atlas_l5_3a4b083c' ||
    mesh.name === 'atlas_l4_08ade9e0' ||
    mesh.name === 'atlas_l3_c6cacbbe' ||
    mesh.name === 'atlas_l2_a58b12bf' ||
    mesh.name === 'atlas_l1_52b1773e' ||
    mesh.name === 'atlas_intervertebral_disc_l5_s1_80789ffd' ||
    mesh.name === 'atlas_intervertebral_disc_l4_l5_260f550f' ||
    mesh.name === 'atlas_intervertebral_disc_l3_l4_bdf9d7c5' ||
    mesh.name === 'atlas_intervertebral_disc_l2_l3_ac930073' ||
    mesh.name === 'atlas_intervertebral_disc_l1_l2_c10e90aa' ||
    mesh.name === 'atlas_intervertebral_disc_t12_l1_5710f59d' ||
    text.includes('intervertebral_disc_l') ||
    text.includes('intervertebral disc l') ||
    text.includes('intervertebral_disc_t12_l1') ||
    text.includes('intervertebral disc t12-l1') ||
    /^atlas_l[1-5](_|$)/.test(mesh.name) ||
    text === 'l1' ||
    text === 'l2' ||
    text === 'l3' ||
    text === 'l4' ||
    text === 'l5' ||
    text.includes('vertebra_l') ||
    text.includes('vertebra l') ||
    text.includes('lumbar_vertebra') ||
    text.includes('lumbar vertebra')
  );
}

/**
 * Deforms and articulates the lower vertebrae (L5, L4, L3, L2, L1) and lumbar intervertebral discs
 * across torso flexion and extension.
 *
 * - L5 attaches directly to the sacrum on the hip bone (S1 endplate at Y = 0.960), remaining
 *   firmly seated with only minimal rotation (~13% of total bend).
 * - L4 through L1 progressively rotate and translate along a smooth continuous spinal arc:
 *   L4 (~31%), L3 (~47%), L2 (~64%), L1 (~80%), meeting the thoracic cage / T12 at 100%.
 * - Adjacent vertebrae preserve intervertebral spacing and stay in continuous contact with zero gaping or collision.
 * - Intervertebral discs smoothly articulate and naturally wedge between the vertebral endplates.
 */
export function deformBridgingLumbarSpineMesh(
  mesh: THREE.Mesh,
  thetaSpine: number,
): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr) return;

  if (!geom.userData.origPositions) {
    geom.userData.origPositions = Float32Array.from(posAttr.array);
  }

  const orig = geom.userData.origPositions as Float32Array;
  const count = posAttr.count;
  const arr = posAttr.array as Float32Array;

  if (!geom.userData.lumbarCenter) {
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < count; i++) {
      const y = orig[i * 3 + 1];
      const z = orig[i * 3 + 2];
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (z < minZ) minZ = z;
      if (z > maxZ) maxZ = z;
    }
    const midY = (minY + maxY) / 2;
    const midZ = (minZ + maxZ) / 2;
    const name = (mesh.name + ' ' + (mesh.userData?.name || '')).toLowerCase();
    const isDisc = name.includes('disc');
    geom.userData.lumbarCenter = { midY, midZ, isDisc };
  }

  const { midY, midZ, isDisc } = geom.userData.lumbarCenter;

  if (Math.abs(thetaSpine) < 1e-6) {
    arr.set(orig);
    posAttr.needsUpdate = true;
    geom.computeVertexNormals();
    return;
  }

  const yBase = 0.960;
  const L = 0.179;

  const s = Math.max(0, Math.min(L, midY - yBase));
  const u = s / L;
  const phi = u * thetaSpine;
  const cosP = Math.cos(phi);
  const sinP = Math.sin(phi);

  const yCenter = yBase + (L / thetaSpine) * Math.sin(phi);
  const zCenter = midZ + (L / thetaSpine) * (1 - Math.cos(phi));

  for (let i = 0; i < count; i++) {
    const idx = i * 3;
    const x0 = orig[idx];
    const y0 = orig[idx + 1];
    const z0 = orig[idx + 2];

    if (isDisc) {
      // Intervertebral disc: elastomeric continuous blend along disc height with anatomical wedging
      const s = Math.max(0, Math.min(L, y0 - yBase));
      const u = s / L;
      const phiv = u * thetaSpine;
      const dyArc = (L / thetaSpine) * Math.sin(phiv) - s;
      const dzArc = (L / thetaSpine) * (1 - Math.cos(phiv));
      const dz = z0 - midZ;
      const dyTilt = -dz * Math.sin(phiv);
      const dzTilt = dz * (Math.cos(phiv) - 1);
      arr[idx] = x0;
      arr[idx + 1] = y0 + dyArc + dyTilt;
      arr[idx + 2] = z0 + dzArc + dzTilt;
    } else {
      // Rigid vertebra bone: rotates and translates with its level along the articulated arc
      const dy = y0 - midY;
      const dz = z0 - midZ;
      arr[idx] = x0;
      arr[idx + 1] = yCenter + (dy * cosP - dz * sinP);
      arr[idx + 2] = zCenter + (dy * sinP + dz * cosP);
    }
  }

  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export function restoreOriginalMeshPositions(mesh: THREE.Mesh): void {
  const geom = mesh.geometry;
  const posAttr = geom.attributes.position;
  if (!posAttr || !geom.userData.origPositions) return;

  const orig = geom.userData.origPositions as Float32Array;
  const arr = posAttr.array as Float32Array;
  arr.set(orig);
  posAttr.needsUpdate = true;
  geom.computeVertexNormals();
}

export const restoreOriginalPsoasPositions = restoreOriginalMeshPositions;
