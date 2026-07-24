export type EventType = 'OrderCreated' | 'OrderUpdated' | 'OrderDeleted' | 'CustomerCreated' | 'InvoicePaid';

export type EventCallback = (payload: any) => void;

class EventBusService {
  private listeners: Map<EventType, Set<EventCallback>> = new Map();

  subscribe(event: EventType, callback: EventCallback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  emit(event: EventType, payload?: any) {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((callback) => {
        try {
          callback(payload);
        } catch (error) {
          console.error(`Error executing listener for event ${event}:`, error);
        }
      });
    }
  }
}

export const EventBus = new EventBusService();
