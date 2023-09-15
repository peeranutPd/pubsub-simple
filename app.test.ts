import {
    IPublishSubscribeService,
    ISubscriber,
    IEvent,
    MachineSaleEvent,
    MachineRefillEvent,
    LowStockWarningEvent,
    StockLevelOkEvent,
    Machine,
    MachineSaleSubscriber,
    MachineRefillSubscriber,
    StockWarningSubscriber,
    createPubSubService,
  } from './app';
  
  describe('PubSubService', () => {
    let pubSubService: IPublishSubscribeService;
    let machines: Machine[];
  
    beforeEach(() => {
    // Initialize the PubSubService and machines before each test
    pubSubService = createPubSubService();
    machines = [new Machine('001'), new Machine('002'), new Machine('003')];
  });

  it('should handle MachineSaleEvent correctly', () => {
    const saleSubscriber: ISubscriber = new MachineSaleSubscriber(machines, pubSubService);
    pubSubService.subscribe('Saled', saleSubscriber);

    // Create and publish a MachineSaleEvent
    const saleEvent: IEvent = new MachineSaleEvent(2, '001');
    pubSubService.publish(saleEvent);

    // Verify that the saleSubscriber has handled the event
    expect(machines[0].stockLevel).toBe(8);
  });

  it('should handle MachineRefillEvent correctly', () => {
    const refillSubscriber: ISubscriber = new MachineRefillSubscriber(machines, pubSubService);
    pubSubService.subscribe('Refilled', refillSubscriber);

    // Create and publish a MachineRefillEvent
    const refillEvent: IEvent = new MachineRefillEvent(3, '002');
    pubSubService.publish(refillEvent);

    // Verify that the refillSubscriber has handled the event
    expect(machines[1].stockLevel).toBe(13);
  });

  it('should handle LowStockWarningEvent and StockLevelOkEvent correctly', () => {
    const stockWarningSubscriber: ISubscriber = new StockWarningSubscriber(machines, pubSubService);
    pubSubService.subscribe('Warning Low Stock Remaining', stockWarningSubscriber);
    pubSubService.subscribe('Stock Level is Ok', stockWarningSubscriber);

    // Create and publish a LowStockWarningEvent
    const warningEvent = new LowStockWarningEvent('003');
    pubSubService.publish(warningEvent);
    // Verify that the lowStockWarnings set contains '003' after a LowStockWarningEvent
    expect(stockWarningSubscriber['lowStockWarnings'].has('003')).toBe(true);

    // Create and publish a StockLevelOkEvent
    const okEvent = new StockLevelOkEvent('003');
    pubSubService.publish(okEvent);

    // Verify that the lowStockWarnings set no longer contains '003' after a StockLevelOkEvent
    expect(stockWarningSubscriber['lowStockWarnings'].has('003')).toBe(false);
  });
});
