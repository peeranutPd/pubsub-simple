// interfaces
interface IEvent {
  type(): string;
  machineId(): string;
}

interface ISubscriber {
  handle(event: IEvent): void;
}

interface IPublishSubscribeService {
  publish (event: IEvent): void;
  subscribe (type: string, handler: ISubscriber): void;
  // unsubscribe ( /* Question 2 - build this feature */ );
  unsubscribe (type: string,handler: ISubscriber): void;
}


// implementations
class MachineSaleEvent implements IEvent {
  constructor(private readonly _sold: number, private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  getSoldQuantity(): number {
    return this._sold
  }

  type(): string {
    return 'Saled';
  }
}

class MachineRefillEvent implements IEvent {
  constructor(private readonly _refill: number, private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  getRefillQuantity(): number {
    return this._refill;
  }

  type(): string {
    return "Refilled";
  }
}

class LowStockWarningEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return 'Warning Low Stock Remaining';
  }
}

class StockLevelOkEvent implements IEvent {
  constructor(private readonly _machineId: string) {}

  machineId(): string {
    return this._machineId;
  }

  type(): string {
    return 'Stock Level is Ok';
  }
}

class MachineSaleSubscriber implements ISubscriber {
constructor(private readonly machines: Machine[], private readonly pubSubService: IPublishSubscribeService) {}

handle(event: MachineSaleEvent): void {
  const machine = this.machines.find((m) => m.id === event.machineId());

  if (machine) {
    machine.stockLevel -= event.getSoldQuantity();
    if (machine.stockLevel < 3) {
      // Generate lowStock
      this.pubSubService.publish(new LowStockWarningEvent(machine.id));
    } else if (machine.stockLevel >= 3) {
      // Generate okStock
      this.pubSubService.publish(new StockLevelOkEvent(machine.id));
    }
  }
}
}

//Question 3
class MachineRefillSubscriber implements ISubscriber {
  constructor(private readonly machines: Machine[], private readonly pubSubService: IPublishSubscribeService) {}

  handle(event: MachineRefillEvent): void {
    const machine = this.machines.find((m) => m.id === event.machineId());

    if (machine) {
      machine.stockLevel += event.getRefillQuantity();

      if (machine.stockLevel >= 3) {
        // Generate StockLevelOkEvent
        this.pubSubService.publish(new StockLevelOkEvent(machine.id));
      }
    }
  }
}

//
class StockWarningSubscriber implements ISubscriber {
  private lowStockWarnings: Set<string> = new Set<string>();

  constructor(pubSubService: IPublishSubscribeService) {}

  handle(event: IEvent): void {
    if (event.type() === 'lowStockWarning') {
      const machineId = event.machineId();
      if (!this.lowStockWarnings.has(machineId)) {
        this.lowStockWarnings.add(machineId);
        console.log(`Machine ${machineId}'s Stick is Low`);
      }
    } else if (event.type() === 'stockLevelOk') {
      const machineId = event.machineId();
      if (this.lowStockWarnings.has(machineId)) {
        this.lowStockWarnings.delete(machineId);
        console.log(`Machine ${machineId}'s Stock is Ok`);
      }
    }
  }
}


// objects
class Machine {
  public stockLevel = 10;
  public id: string;

  constructor (id: string) {
    this.id = id;
  }
}


// helpers
const randomMachine = (): string => {
  const random = Math.random() * 3;
  if (random < 1) {
    return '001';
  } else if (random < 2) {
    return '002';
  }
  return '003';

}

const eventGenerator = (): IEvent => {
  const random = Math.random();
  if (random < 0.5) {
    const saleQty = Math.random() < 0.5 ? 1 : 2; // 1 or 2
    return new MachineSaleEvent(saleQty, randomMachine());
  } 
  const refillQty = Math.random() < 0.5 ? 3 : 5; // 3 or 5
  return new MachineRefillEvent(refillQty, randomMachine());
}

// create the PubSub service Function that return object of type IPublishSubscribeService
const createPubSubService = (): IPublishSubscribeService => {
  // create empty objects to map event types to arrays of subscribers
  const subscribers: Record<string, ISubscriber[]> = {};

  const publish = (event: IEvent): void => {
    const eventType = event.type();

    if (subscribers[eventType]) {
      subscribers[eventType].forEach((handler) => handler.handle(event));
    }
  };

  const subscribe = (type: string, handler: ISubscriber): void => {
    if (!subscribers[type]) {
      subscribers[type] = [];
    }
    subscribers[type].push(handler);
  };

  
//Question 2
  const unsubscribe = (type: string, handler: ISubscriber): void => {
    const handlers = subscribers[type];

    if (handlers) {
      subscribers[type] = handlers.filter((h) => h !== handler);
    }
  };

  return {
    publish,
    subscribe,
    unsubscribe,
  };
};


// program
(async () => {
  // create 3 machines with a quantity of 10 stock
  const machines: Machine[] = [ new Machine('001'), new Machine('002'), new Machine('003') ];

  //createPubSubService at line 100
  const pubSubService = createPubSubService();

  // create a machine sale event subscriber. inject the machines (all subscribers should do this)
  const saleSubscriber = new MachineSaleSubscriber(machines, pubSubService);
  // Refill Subscriber
  const refillSubscriber = new MachineRefillSubscriber(machines, pubSubService);
  // Stock Warning
  const stockWarningSubscriber = new StockWarningSubscriber(pubSubService);

  //Subscribe subscribers to event types
  pubSubService.subscribe('sale', saleSubscriber);
  pubSubService.subscribe('refill', refillSubscriber);
  pubSubService.subscribe('lowStockWarning', stockWarningSubscriber);
  pubSubService.subscribe('stockLevelOk', stockWarningSubscriber);

  // create 5 random events && Publish
  const events = [1, 2, 3, 4, 5].map((i) => eventGenerator());
  events.forEach(pubSubService.publish)
})();