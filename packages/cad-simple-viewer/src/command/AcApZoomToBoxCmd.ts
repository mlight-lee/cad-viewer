import { AcApContext } from '../app'
import { AcApDocManager } from '../app'
import { AcEdCommand } from '../command'
import { AcEdBaseView, AcEdJig } from '../editor'

/**
 * Jig for handling zoom-to-box selection interaction.
 *
 * This jig handles the user interaction for selecting a rectangular
 * area to zoom to. It extends {@link AcEdJig} to provide interactive
 * selection capabilities.
 *
 * The jig allows users to:
 * - Select a rectangular area on the drawing
 * - Zoom the view to fit the selected area
 * - Provide visual feedback during selection
 *
 * @example
 * ```typescript
 * const jig = new AcApZoomToBoxJig(view);
 * await jig.drag(); // User selects area to zoom to
 * ```
 */
export class AcApZoomToBoxJig extends AcEdJig<boolean> {
  /**
   * Creates a new zoom-to-box jig.
   *
   * @param view - The view that will be zoomed
   */
  constructor(view: AcEdBaseView) {
    super(view)
  }

  /**
   * Handles the selection sampling and zooming operation.
   *
   * This method gets the user's selection box and applies
   * the zoom operation to fit that area in the view.
   *
   * @returns Promise that resolves when the zoom operation completes
   */
  async sampler() {
    await AcApDocManager.instance.editor.getSelection().then(box => {
      return this.view.zoomTo(box, 1)
    })
  }
}

/**
 * Command for zooming to a user-selected rectangular area.
 *
 * This command initiates an interactive zoom-to-box operation where:
 * - User selects a rectangular area by dragging
 * - The view zooms to fit the selected area
 * - The zoom level is adjusted to show the entire selected region
 *
 * This provides precise navigation control, allowing users to quickly
 * focus on specific areas of large drawings.
 *
 * @example
 * ```typescript
 * const zoomToBoxCmd = new AcApZoomToBoxCmd();
 * await zoomToBoxCmd.execute(context); // User selects area to zoom to
 * ```
 */
export class AcApZoomToBoxCmd extends AcEdCommand {
  /**
   * Executes the zoom-to-box command.
   *
   * Creates a jig for interactive area selection and initiates
   * the drag operation for the user to select the zoom area.
   *
   * @param context - The application context containing the view
   * @returns Promise that resolves when the zoom operation completes
   */
  async execute(context: AcApContext) {
    const jig = new AcApZoomToBoxJig(context.view)
    await jig.drag()
  }
}
