import { AcGeBox2d, AcGeBox3d } from '@mlightcad/data-model'
import * as THREE from 'three'

const threeBox3dToGeBox3d = (from: THREE.Box3) => {
  return new AcGeBox3d(from.min, from.max)
}

const goBox3dToThreeBox3d = (from: AcGeBox3d) => {
  return new THREE.Box3(
    from.min as unknown as THREE.Vector3,
    from.max as unknown as THREE.Vector3
  )
}

const threeBo2dToGeBox2d = (from: THREE.Box2) => {
  return new AcGeBox2d(from.min, from.max)
}

const goBox2dToThreeBox2d = (from: AcGeBox2d) => {
  return new THREE.Box2(
    from.min as unknown as THREE.Vector2,
    from.max as unknown as THREE.Vector2
  )
}

const threeBox3dToGeBox2d = (from: THREE.Box3) => {
  return new AcGeBox2d(from.min, from.max)
}

const goBox2dToThreeBox3d = (from: AcGeBox2d) => {
  const threeBox3d = new THREE.Box3()
  threeBox3d.min.set(from.min.x, from.min.y, 0)
  threeBox3d.max.set(from.max.x, from.max.y, 0)
  return threeBox3d
}

const AcTrGeometryUtil = {
  threeBo2dToGeBox2d: threeBo2dToGeBox2d,
  goBox2dToThreeBox2d: goBox2dToThreeBox2d,
  threeBox3dToGeBox3d: threeBox3dToGeBox3d,
  goBox3dToThreeBox3d: goBox3dToThreeBox3d,
  threeBox3dToGeBox2d: threeBox3dToGeBox2d,
  goBox2dToThreeBox3d: goBox2dToThreeBox3d
}

export {
  threeBo2dToGeBox2d,
  goBox2dToThreeBox2d,
  threeBox3dToGeBox3d,
  goBox3dToThreeBox3d,
  threeBox3dToGeBox2d,
  goBox2dToThreeBox3d,
  AcTrGeometryUtil
}
