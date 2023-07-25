import Tag "./Tag";
import FuncMode "./FuncMode";
import Order "mo:base/Order";
import Array "mo:base/Array";
import Iter "mo:base/Iter";

module {

  public type ReferenceType = Int;

  public type RecordFieldReferenceType<TReference> = {
    tag: Tag.Tag;
    _type : TReference;
  };

  public type VariantOptionReferenceType<TReference> = RecordFieldReferenceType<TReference>;

  public type FuncReferenceType<TReference> = {
    modes : [FuncMode.FuncMode];
    argTypes : [TReference];
    returnTypes : [TReference];
  };



  public type ServiceReferenceType<TReference> = {
    methods : [(Text, TReference)];
  };



  public type ShallowCompoundType<TReference> = {
    #opt : TReference;
    #vector : TReference;
    #record : [RecordFieldReferenceType<TReference>];
    #variant : [VariantOptionReferenceType<TReference>];
    #_func : FuncReferenceType<TReference>;
    #service : ServiceReferenceType<TReference>;
  };



  public func tagObjCompare(o1: {tag: Tag.Tag}, o2: {tag: Tag.Tag}) : Order.Order {
    Tag.compare(o1.tag, o2.tag);
  };

  public func arraysAreEqual<T>(
    a1: [T],
    a2: [T],
    orderFunc: ?((T, T) -> Order.Order),
    equalFunc: (T, T) -> Bool,
  ) : Bool {
    if (a1.size() != a2.size()) {
      return false;
    };
    let (orderedA1, orderedA2) = switch (orderFunc) {
      case (null) (a1, a2);
      case (?o) (Array.sort(a1, o), Array.sort(a2, o));
    };
    for (i in Iter.range(0, orderedA1.size() - 1)) {
      let a1I = orderedA1[i];
      let a2I = orderedA2[i];
      if (not equalFunc(a1I, a2I)) {
        return false;
      };
    };
    true;
  };
}