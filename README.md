**Build the Publish-Subscribe Mechanism**


1.**ISubscriber Registration**: Allow ISubscriber objects to register against a concrete IPublishSubscribeService object for an event type.

2.**Publish Method: Implement** the publish method so that when a publish event occurs, all subscribers of that event type will have a chance to handle the event. Subscribers should work off a shared array of Machine objects, mutating them depending on the event received.

3.**Unsubscribe Method**: Add the method 'unsubscribe' on IPublishSubscribeService to allow handlers to unsubscribe from events. You may change the existing method signatures.

4.**MachineRefillSubscriber**: Implement MachineRefillSubscriber. It should increase the stock quantity of the machine.


**Additional Behavior**


1.**Low Stock Warning**: If a machine stock level drops below 3, a new LowStockWarningEvent should be generated.

2.**Stock Level OK**: When the stock levels hit 3 or above (because of a MachineRefillEvent), a StockLevelOkEvent should be generated. For each machine, LowStockWarningEvent or StockLevelOkEvent should only fire one time when crossing the threshold of 3.


**Implementation Details**


The codebase is organized as follows:

**IPublishSubscribeService**: Interface defining the contract for the Publish-Subscribe service.

Machine: Class representing a vending machine with stock information.

**ISubscriber**: Interface for event subscribers, defining the handle method.

**MachineSaleEvent**: Event class for machine sales.

**MachineRefillEvent**: Event class for machine refills.

**LowStockWarningEvent**: Event class for low stock warnings.

**StockLevelOkEvent**: Event class for stock level ok notifications.

**PublishSubscribeService**: Implementation of the Publish-Subscribe service.

**MachineRefillSubscriber**: Implementation of the MachineRefillSubscriber to handle machine refills.

**StockWarningSubscriber**: Example of a subscriber for low stock warnings and stock level ok notifications.
