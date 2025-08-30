import { AcGeBox2d, AcGeBox3d, AcGePoint2dLike } from '@mlightcad/data-model'
import * as THREE from 'three'

/**
 * Converts a Three.js Box3 to a CAD geometry AcGeBox3d.
 *
 * @param from - The Three.js Box3 to convert
 * @returns The equivalent CAD geometry Box3d
 */
const threeBox3dToGeBox3d = (from: THREE.Box3) => {
  return new AcGeBox3d(from.min, from.max)
}

/**
 * Converts a CAD geometry AcGeBox3d to a CAD geometry Box2.
 *
 * @param from - The CAD geometry Box3d to convert
 * @returns The converted CAD geometry Box2
 */
const geBox3dToGeBox2d = (from: AcGeBox3d) => {
  return new AcGeBox2d(
    from.min as unknown as AcGePoint2dLike,
    from.max as unknown as AcGePoint2dLike
  )
}

/**
 * Converts a CAD geometry AcGeBox3d to a Three.js Box3.
 *
 * @param from - The CAD geometry Box3d to convert
 * @returns The equivalent Three.js Box3
 */
const geBox3dToThreeBox3d = (from: AcGeBox3d) => {
  return new THREE.Box3(
    from.min as unknown as THREE.Vector3,
    from.max as unknown as THREE.Vector3
  )
}

/**
 * Converts a Three.js Box2 to a CAD geometry AcGeBox2d.
 *
 * @param from - The Three.js Box2 to convert
 * @returns The equivalent CAD geometry Box2d
 */
const threeBox2dToGeBox2d = (from: THREE.Box2) => {
  return new AcGeBox2d(from.min, from.max)
}

/**
 * Converts a CAD geometry Box2d to a Three.js Box2.
 *
 * @param from - The CAD geometry Box2d to convert
 * @returns The equivalent Three.js Box2
 */
const geBox2dToThreeBox2d = (from: AcGeBox2d) => {
  return new THREE.Box2(
    from.min as unknown as THREE.Vector2,
    from.max as unknown as THREE.Vector2
  )
}

/**
 * Converts a Three.js Box3 to a CAD geometry Box2d by ignoring the Z dimension.
 *
 * @param from - The Three.js Box3 to convert
 * @returns The equivalent CAD geometry Box2d (Z dimension discarded)
 */
const threeBox3dToGeBox2d = (from: THREE.Box3) => {
  return new AcGeBox2d(from.min, from.max)
}

/**
 * Converts a CAD geometry AcGeBox2d to a Three.js Box3 by setting Z dimension to 0.
 *
 * @param from - The CAD geometry Box2d to convert
 * @returns The equivalent Three.js Box3 with Z=0
 */
const geBox2dToThreeBox3d = (from: AcGeBox2d) => {
  const threeBox3d = new THREE.Box3()
  threeBox3d.min.set(from.min.x, from.min.y, 0)
  threeBox3d.max.set(from.max.x, from.max.y, 0)
  return threeBox3d
}

/**
 * Utility object containing geometry conversion functions between Three.js and CAD geometry types.
 *
 * This utility provides bidirectional conversion functions for bounding boxes:
 * - Between 2D and 3D bounding boxes
 * - Between Three.js and CAD geometry coordinate systems
 * - Cross-dimensional conversions (2D ↔ 3D)
 *
 * @example
 * ```typescript
 * // Convert Three.js box to CAD geometry
 * const threeBox = new THREE.Box3();
 * const cadBox = AcTrGeometryUtil.threeBox3dToGeBox3d(threeBox);
 *
 * // Convert CAD geometry box to Three.js
 * const cadBox2d = new AcGeBox2d();
 * const threeBox2d = AcTrGeometryUtil.goBox2dToThreeBox2d(cadBox2d);
 *
 * // Cross-dimensional conversion
 * const threeBox3d = new THREE.Box3();
 * const cadBox2d = AcTrGeometryUtil.threeBox3dToGeBox2d(threeBox3d);
 * ```
 */
const AcTrGeometryUtil = {
  /** Converts Three.js Box2 to CAD geometry AcGeBox2d */
  threeBo2dToGeBox2d: threeBox2dToGeBox2d,
  /** Converts CAD geometry AcGeBox2d to Three.js Box2 */
  geBox2dToThreeBox2d: geBox2dToThreeBox2d,
  /** Converts Three.js Box3 to CAD geometry AcGeBox3d */
  threeBox3dToGeBox3d: threeBox3dToGeBox3d,
  /** Converts CAD geometry AcGeBox3d to Three.js Box3 */
  geBox3dToThreeBox3d: geBox3dToThreeBox3d,
  /** Converts CAD geometry AcGeBox3d to CAD geometry AcGeBox2d */
  goBox3dToGeBox2d: geBox3dToGeBox2d,
  /** Converts Three.js Box3 to CAD geometry Box2d (ignores Z) */
  threeBox3dToGeBox2d: threeBox3dToGeBox2d,
  /** Converts CAD geometry AcGeBox2d to Three.js Box3 (Z=0) */
  geBox2dToThreeBox3d: geBox2dToThreeBox3d
}

export {
  threeBox2dToGeBox2d,
  geBox2dToThreeBox2d,
  threeBox3dToGeBox3d,
  geBox3dToThreeBox3d,
  geBox3dToGeBox2d,
  threeBox3dToGeBox2d,
  geBox2dToThreeBox3d,
  AcTrGeometryUtil
}
