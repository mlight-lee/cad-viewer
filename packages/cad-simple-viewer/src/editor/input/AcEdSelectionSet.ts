import { AcCmEventManager } from '@mlightcad/data-model'
import { AcDbObjectId } from '@mlightcad/data-model'

/**
 * Event arguments for selection-related events.
 *
 * Contains the entity IDs that were involved in the selection change.
 */
export interface AcEdSelectionEventArgs {
  /** Array of entity IDs that were added or removed from selection */
  ids: AcDbObjectId[]
}

/**
 * Manages a collection of selected CAD entities in the current view.
 *
 * This class maintains a set of selected entity IDs and provides methods to:
 * - Add entities to the selection
 * - Remove entities from the selection
 * - Clear all selections
 * - Query selection state and count
 * - Listen for selection change events
 *
 * The selection set fires events when entities are added or removed, allowing
 * other components (like the view) to respond to selection changes by showing
 * grip points, updating UI, etc.
 *
 * @example
 * ```typescript
 * const selectionSet = new AcEdSelectionSet();
 *
 * // Listen for selection changes
 * selectionSet.events.selectionAdded.addEventListener(args => {
 *   console.log('Added entities:', args.ids);
 * });
 *
 * // Add entities to selection
 * selectionSet.add(['entity1', 'entity2']);
 *
 * // Check selection
 * if (selectionSet.count > 0) {
 *   console.log(`${selectionSet.count} entities selected`);
 * }
 *
 * // Clear selection
 * selectionSet.clear();
 * ```
 */
export class AcEdSelectionSet {
  /** Internal set storing the selected entity IDs */
  private _ids: Set<AcDbObjectId>

  /** Events fired when selection changes */
  public readonly events = {
    /** Fired when entities are added to the selection */
    selectionAdded: new AcCmEventManager<AcEdSelectionEventArgs>(),
    /** Fired when entities are removed from the selection */
    selectionRemoved: new AcCmEventManager<AcEdSelectionEventArgs>()
  }

  /**
   * Creates a new selection set.
   *
   * @param ids - Optional initial array of entity IDs to include in the selection
   *
   * @example
   * ```typescript
   * // Create empty selection set
   * const selectionSet = new AcEdSelectionSet();
   *
   * // Create selection set with initial entities
   * const selectionSet = new AcEdSelectionSet(['entity1', 'entity2']);
   * ```
   */
  constructor(ids: AcDbObjectId[] = []) {
    this._ids = new Set<AcDbObjectId>(ids)
  }

  /**
   * Gets an array of all selected entity IDs.
   *
   * @returns Array containing all selected entity IDs
   */
  get ids() {
    return Array.from(this._ids)
  }

  /**
   * Gets the number of selected entities.
   *
   * @returns The count of selected entities
   */
  get count() {
    return this._ids.size
  }

  /**
   * Adds one or more entities to the selection.
   *
   * Fires a `selectionAdded` event with the added entity IDs.
   * Duplicate IDs are automatically handled by the internal Set.
   *
   * @param value - Single entity ID or array of entity IDs to add
   *
   * @example
   * ```typescript
   * // Add single entity
   * selectionSet.add('entity1');
   *
   * // Add multiple entities
   * selectionSet.add(['entity2', 'entity3', 'entity4']);
   * ```
   */
  add(value: AcDbObjectId | AcDbObjectId[]) {
    if (Array.isArray(value)) {
      value.forEach(item => this._ids.add(item))
      this.events.selectionAdded.dispatch({ ids: value })
    } else {
      this._ids.add(value)
      this.events.selectionAdded.dispatch({ ids: [value] })
    }
  }

  /**
   * Removes one or more entities from the selection.
   *
   * Fires a `selectionRemoved` event with the removed entity IDs.
   * Non-existent IDs are silently ignored.
   *
   * @param value - Single entity ID or array of entity IDs to remove
   *
   * @example
   * ```typescript
   * // Remove single entity
   * selectionSet.delete('entity1');
   *
   * // Remove multiple entities
   * selectionSet.delete(['entity2', 'entity3']);
   * ```
   */
  delete(value: AcDbObjectId | AcDbObjectId[]) {
    if (Array.isArray(value)) {
      value.forEach(item => this._ids.delete(item))
      this.events.selectionRemoved.dispatch({ ids: value })
    } else {
      this._ids.delete(value)
      this.events.selectionRemoved.dispatch({ ids: [value] })
    }
  }

  /**
   * Checks if an entity is currently selected.
   *
   * @param id - The entity ID to check
   * @returns True if the entity is selected, false otherwise
   *
   * @example
   * ```typescript
   * if (selectionSet.has('entity1')) {
   *   console.log('Entity1 is selected');
   * }
   * ```
   */
  has(id: AcDbObjectId) {
    return this._ids.has(id)
  }

  /**
   * Removes all entities from the selection.
   *
   * Fires a `selectionRemoved` event with all previously selected entity IDs.
   *
   * @example
   * ```typescript
   * selectionSet.clear(); // Deselect everything
   * ```
   */
  clear() {
    if (this._ids.size > 0) {
      const ids = Array.from(this._ids)
      this._ids.clear()
      this.events.selectionRemoved.dispatch({ ids })
    }
  }
}
