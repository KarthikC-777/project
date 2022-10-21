export class UserDto {
  readonly userId: string;
  readonly name: string;
  readonly email: string;
  readonly password: string;
  readonly phonenumber: number;
  readonly salary: number;
  readonly role: string[];
  readonly designation: string;
  readonly status: string;
  readonly address: string;
  readonly availableLeaves: number;
}

export class EmployeeDto {
  readonly name: string;
  readonly email: string;
  readonly phonenumber: number;
  readonly address: string;
}
