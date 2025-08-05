import {
  AcCmColor,
  AcDbArc,
  AcDbDatabase,
  AcDbHatch,
  AcDbLine,
  AcDbMText,
  AcDbTextStyleTableRecord,
  AcGeCircArc2d,
  AcGeLine2d,
  AcGeLine3d,
  AcGeLoop2d,
  AcGeMathUtil,
  AcGePoint3d,
  AcGePolyline2d,
  AcGiMTextAttachmentPoint,
  AcGiTextStyle
} from '@mlightcad/data-model'

const DEFAULT_FONT = 'simsun'

/**
 * This is an internal class used to create some exmaple data.
 * @internal
 */
export class AcApDocCreator {
  private static _instance?: AcApDocCreator

  static get instance() {
    if (!AcApDocCreator._instance) {
      AcApDocCreator._instance = new AcApDocCreator()
    }
    return AcApDocCreator._instance
  }

  createExampleDoc1(db: AcDbDatabase) {
    const rowCount = 2
    const colCount = 2
    for (let i = 0; i < rowCount; ++i) {
      for (let j = 0; j < colCount; ++j) {
        const hatch = new AcDbHatch()
        const circle = new AcGePolyline2d()
        circle.addVertexAt(0, { x: j * 100, y: i * 100, bulge: 1 })
        circle.addVertexAt(1, { x: j * 100 + 100, y: i * 100, bulge: 1 })
        circle.closed = true
        hatch.add(circle)
        db.tables.blockTable.modelSpace.appendEntity(hatch)
      }
    }
  }

  createExampleDoc2(db: AcDbDatabase) {
    const modelSpace = db.tables.blockTable.modelSpace
    modelSpace.appendEntity(this.createArc())
    const lines = this.createLines()
    lines.forEach(line => {
      db.tables.blockTable.modelSpace.appendEntity(
        new AcDbLine(line.startPoint, line.endPoint)
      )
    })
    modelSpace.appendEntity(this.createHatch())

    db.tables.textStyleTable.add(this.createTextStyle())
    modelSpace.appendEntity(this.createMText())
  }

  private createTextStyle() {
    const textStyle: AcGiTextStyle = {
      bigFont: '',
      color: 0xffffff,
      extendedFont: DEFAULT_FONT,
      fixedTextHeight: 0,
      font: DEFAULT_FONT,
      lastHeight: 0.2,
      name: 'Standard',
      obliqueAngle: 0,
      standardFlag: 0,
      textGenerationFlag: 0,
      widthFactor: 0.667
    }
    return new AcDbTextStyleTableRecord(textStyle)
  }

  private createMText() {
    const mtext = new AcDbMText()
    mtext.attachmentPoint = AcGiMTextAttachmentPoint.MiddleLeft
    mtext.color = new AcCmColor().setColorName('red')
    mtext.layer = '0'
    mtext.location = new AcGePoint3d(9850, 86773, 0)
    mtext.contents = '{\\W0.667;\\T1.1;智慧8081}'
    mtext.height = 200
    mtext.width = 1000
    mtext.styleName = 'Standard'
    return mtext
  }

  private createHatch() {
    const lines = this.createLines()
    const hatch = new AcDbHatch()
    const loops = new AcGeLoop2d()
    loops.add(
      new AcGeCircArc2d(
        { x: 20241.23355899991, y: 174118.6312674369 },
        89258.30757455899,
        AcGeMathUtil.degToRad(262.2471115358437),
        AcGeMathUtil.degToRad(264.444541053754),
        false
      )
    )
    lines.forEach(line => {
      loops.add(new AcGeLine2d(line.startPoint, line.endPoint))
    })
    hatch.add(loops)
    return hatch
  }

  private createArc() {
    return new AcDbArc(
      { x: 20241.23355899991, y: 174118.6312674369, z: 0 },
      89258.30757455899,
      AcGeMathUtil.degToRad(262.2471115358437),
      AcGeMathUtil.degToRad(264.444541053754)
    )
  }

  private createLines() {
    const lines: AcGeLine3d[] = []
    lines.push(
      new AcGeLine3d(
        {
          x: 11600.20888122753,
          y: 85279.57362051727,
          z: 0
        },
        {
          x: 11600.20890652924,
          y: 86546.03982284805,
          z: 0
        }
      )
    )
    lines.push(
      new AcGeLine3d(
        {
          x: 11600.20890652924,
          y: 86546.03982284805,
          z: 0
        },
        {
          x: 10850.20885583921,
          y: 86546.03980174381,
          z: 0
        }
      )
    )
    lines.push(
      new AcGeLine3d(
        {
          x: 10850.2088602169,
          y: 86546.03967292747,
          z: 0
        },
        {
          x: 9050.208860216895,
          y: 86546.039672927,
          z: 0
        }
      )
    )
    lines.push(
      new AcGeLine3d(
        {
          x: 9050.208855839213,
          y: 86546.0397510943,
          z: 0
        },
        {
          x: 8200.209067034302,
          y: 86546.039727177,
          z: 0
        }
      )
    )
    lines.push(
      new AcGeLine3d(
        {
          x: 8200.209067034302,
          y: 86546.039727177,
          z: 0
        },
        {
          x: 8200.209067033837,
          y: 85676.22514764359,
          z: 0
        }
      )
    )
    return lines
  }
}
