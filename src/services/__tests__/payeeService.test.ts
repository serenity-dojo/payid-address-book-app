import { describe, it, expect, beforeEach } from 'vitest';
import { payeeService } from '../payeeService';
import type { PayeeData } from '../../types/payee';

describe('PayeeService', () => {
  beforeEach(() => {
    // Reset service state before each test
    payeeService.clearPayees();
  });

  describe('getAllPayees', () => {
    it('should return empty array when no payees exist', async () => {
      const payees = await payeeService.getAllPayees();
      expect(payees).toEqual([]);
    });

    it('should return payees sorted alphabetically by name', async () => {
      const mockData: PayeeData[] = [
        {
          id: '1',
          name: 'Zoe Adams',
          payid: 'zoe@example.com',
          payidType: 'email',
          nickname: 'Z'
        },
        {
          id: '2', 
          name: 'Alice Brown',
          payid: 'alice@example.com',
          payidType: 'email'
        },
        {
          id: '3',
          name: 'Bob Charlie',
          payid: '0412345678',
          payidType: 'mobile',
          nickname: 'Bobby'
        }
      ];

      payeeService.setMockData(mockData);
      const payees = await payeeService.getAllPayees();

      expect(payees).toHaveLength(3);
      expect(payees[0].displayName).toBe('Alice Brown');
      expect(payees[1].displayName).toBe('Bob Charlie (Bobby)');
      expect(payees[2].displayName).toBe('Zoe Adams (Z)');
    });

    it('should format display names correctly with nicknames', async () => {
      const mockData: PayeeData[] = [
        {
          id: '1',
          name: 'Alexandra Smith',
          payid: 'a.smith@example.com',
          payidType: 'email',
          nickname: 'Lexi'
        }
      ];

      payeeService.setMockData(mockData);
      const payees = await payeeService.getAllPayees();

      expect(payees[0].displayName).toBe('Alexandra Smith (Lexi)');
    });

    it('should format display names correctly without nicknames', async () => {
      const mockData: PayeeData[] = [
        {
          id: '1',
          name: 'Sarah Thompson',
          payid: 's.thompson@work.com',
          payidType: 'email'
        }
      ];

      payeeService.setMockData(mockData);
      const payees = await payeeService.getAllPayees();

      expect(payees[0].displayName).toBe('Sarah Thompson');
    });

    it('should format mobile numbers with spaces', async () => {
      const mockData: PayeeData[] = [
        {
          id: '1',
          name: 'Andy Bolton',
          payid: '0412784539',
          payidType: 'mobile',
          nickname: 'AndyB'
        },
        {
          id: '2',
          name: 'Marcus Williams', 
          payid: '0433859120',
          payidType: 'mobile'
        }
      ];

      payeeService.setMockData(mockData);
      const payees = await payeeService.getAllPayees();

      expect(payees[0].formattedPayID).toBe('0412 784 539');
      expect(payees[0].rawPayID).toBe('0412784539');
      expect(payees[1].formattedPayID).toBe('0433 859 120');
      expect(payees[1].rawPayID).toBe('0433859120');
    });

    it('should not format email PayIDs', async () => {
      const mockData: PayeeData[] = [
        {
          id: '1',
          name: 'Alexandra Smith',
          payid: 'a.smith@example.com',
          payidType: 'email',
          nickname: 'Lexi'
        }
      ];

      payeeService.setMockData(mockData);
      const payees = await payeeService.getAllPayees();

      expect(payees[0].formattedPayID).toBe('a.smith@example.com');
      expect(payees[0].rawPayID).toBe('a.smith@example.com');
    });

    it('should not format ABN PayIDs', async () => {
      const mockData: PayeeData[] = [
        {
          id: '1',
          name: 'Willow Finance Pty Ltd',
          payid: '80123456789',
          payidType: 'abn',
          nickname: 'Willow'
        }
      ];

      payeeService.setMockData(mockData);
      const payees = await payeeService.getAllPayees();

      expect(payees[0].formattedPayID).toBe('80123456789');
      expect(payees[0].rawPayID).toBe('80123456789');
    });

    it('should preserve all required fields in DisplayPayee', async () => {
      const mockData: PayeeData[] = [
        {
          id: '1',
          name: 'Test User',
          payid: 'test@example.com',
          payidType: 'email',
          nickname: 'Tester'
        }
      ];

      payeeService.setMockData(mockData);
      const payees = await payeeService.getAllPayees();

      expect(payees[0]).toEqual({
        id: '1',
        displayName: 'Test User (Tester)',
        formattedPayID: 'test@example.com',
        rawPayID: 'test@example.com',
        payidType: 'email'
      });
    });
  });

  describe('setMockData', () => {
    it('should replace existing payees with new data', async () => {
      const initialData: PayeeData[] = [
        {
          id: '1',
          name: 'Initial User',
          payid: 'initial@example.com',
          payidType: 'email'
        }
      ];

      payeeService.setMockData(initialData);
      let payees = await payeeService.getAllPayees();
      expect(payees).toHaveLength(1);
      expect(payees[0].displayName).toBe('Initial User');

      const newData: PayeeData[] = [
        {
          id: '2',
          name: 'New User',
          payid: 'new@example.com',
          payidType: 'email'
        }
      ];

      payeeService.setMockData(newData);
      payees = await payeeService.getAllPayees();
      expect(payees).toHaveLength(1);
      expect(payees[0].displayName).toBe('New User');
    });
  });

  describe('clearPayees', () => {
    it('should remove all payees', async () => {
      const mockData: PayeeData[] = [
        {
          id: '1',
          name: 'Test User',
          payid: 'test@example.com',
          payidType: 'email'
        }
      ];

      payeeService.setMockData(mockData);
      let payees = await payeeService.getAllPayees();
      expect(payees).toHaveLength(1);

      payeeService.clearPayees();
      payees = await payeeService.getAllPayees();
      expect(payees).toHaveLength(0);
    });
  });

  describe('addPayee', () => {
    it('should add a new email payee successfully', async () => {
      const payeeData = {
        name: 'John Smith',
        payid: 'john@example.com',
        payidType: 'email' as const,
        nickname: 'Johnny'
      };

      const addedPayee = await payeeService.addPayee(payeeData);

      expect(addedPayee.id).toBeDefined();
      expect(addedPayee.name).toBe('John Smith');
      expect(addedPayee.payid).toBe('john@example.com');
      expect(addedPayee.payidType).toBe('email');
      expect(addedPayee.nickname).toBe('Johnny');

      // Verify it was added to the list
      const allPayees = await payeeService.getAllPayees();
      expect(allPayees).toHaveLength(1);
      expect(allPayees[0].displayName).toBe('John Smith (Johnny)');
    });

    it('should add a new mobile payee successfully', async () => {
      const payeeData = {
        name: 'Jane Doe',
        payid: '0412345678',
        payidType: 'mobile' as const
      };

      const addedPayee = await payeeService.addPayee(payeeData);

      expect(addedPayee.name).toBe('Jane Doe');
      expect(addedPayee.payid).toBe('0412345678');
      expect(addedPayee.payidType).toBe('mobile');
      expect(addedPayee.nickname).toBeUndefined();

      // Verify formatting in display
      const allPayees = await payeeService.getAllPayees();
      expect(allPayees[0].formattedPayID).toBe('0412 345 678');
    });

    it('should add a new ABN payee successfully', async () => {
      const payeeData = {
        name: 'Test Business Pty Ltd',
        payid: '80123456789',
        payidType: 'abn' as const,
        nickname: 'TestBiz'
      };

      const addedPayee = await payeeService.addPayee(payeeData);

      expect(addedPayee.name).toBe('Test Business Pty Ltd');
      expect(addedPayee.payid).toBe('80123456789');
      expect(addedPayee.payidType).toBe('abn');
      expect(addedPayee.nickname).toBe('TestBiz');
    });

    it('should generate unique IDs for different payees', async () => {
      const payee1 = await payeeService.addPayee({
        name: 'User One',
        payid: 'one@example.com',
        payidType: 'email'
      });

      const payee2 = await payeeService.addPayee({
        name: 'User Two',
        payid: 'two@example.com',
        payidType: 'email'
      });

      expect(payee1.id).toBeDefined();
      expect(payee2.id).toBeDefined();
      expect(payee1.id).not.toBe(payee2.id);
    });

    it('should maintain sort order after adding payees', async () => {
      await payeeService.addPayee({
        name: 'Zoe Adams',
        payid: 'zoe@example.com',
        payidType: 'email'
      });

      await payeeService.addPayee({
        name: 'Alice Brown',
        payid: 'alice@example.com',
        payidType: 'email'
      });

      const allPayees = await payeeService.getAllPayees();
      expect(allPayees).toHaveLength(2);
      expect(allPayees[0].displayName).toBe('Alice Brown');
      expect(allPayees[1].displayName).toBe('Zoe Adams');
    });

    it('should handle payees without nicknames', async () => {
      const payeeData = {
        name: 'No Nickname User',
        payid: 'nonick@example.com',
        payidType: 'email' as const
      };

      const addedPayee = await payeeService.addPayee(payeeData);

      expect(addedPayee.nickname).toBeUndefined();

      const allPayees = await payeeService.getAllPayees();
      expect(allPayees[0].displayName).toBe('No Nickname User');
    });
  });
});