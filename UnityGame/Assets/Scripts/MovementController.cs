using UnityEngine;
using UnityEngine.Serialization;

public class MovementController : MonoBehaviour
{
    [Header("Camera")] [SerializeField] private Camera cam;
    [SerializeField] private float mouseSensitivity = 100.0f;
    [SerializeField] private float maxLookAngle = 90.0f;

    [Header("Movement")] [SerializeField] private float walkSpeed = 10.0f;
    [SerializeField] private float sprintSpeed = 20.0f;
    [SerializeField] private float crouchSpeed = 2.5f;
    [SerializeField] private float maxVelocityChange = 15.0f;
    [SerializeField] private float jumpForce = 7.0f;

    [Header("Crouch")] [SerializeField] private float crouchHeight = 1.0f;
    [SerializeField] private float crouchTransitionSpeed = 10.0f;

    [Header("Networking")] [SerializeField]
    private NetworkManager networkManager;

    [SerializeField] private float sendInterval = 0.05f;

    [Header("Ground Detection")] [SerializeField]
    private float groundCheckDistance = 1f;

    [SerializeField] private LayerMask groundMask = ~0;

    private Rigidbody rb;
    private CapsuleCollider _collider;
    private float _yaw;
    private float _pitch;
    private bool _isWalking;
    public bool isGrounded;
    private bool _jumpRequested;
    private bool _isCrouching;
    private float _standingHeight;
    private Vector3 _standingCenter;
    private float _standingCamY;
    private float _sendTimer;

    // Friction from the ground's physics material (0..1+), default 1 = full grip
    private float _groundFriction = 0.0001f;

    void Start()
    {
        rb = GetComponent<Rigidbody>();
        rb.freezeRotation = true;

        _collider = GetComponent<CapsuleCollider>();
        _standingHeight = _collider.height;
        _standingCenter = _collider.center;
        _standingCamY = cam.transform.localPosition.y;

        Cursor.lockState = CursorLockMode.Locked;
        Cursor.visible = false;
    }

    void Update()
    {
        _yaw = transform.localEulerAngles.y + Input.GetAxis("Mouse X") * mouseSensitivity * Time.deltaTime;
        _pitch -= mouseSensitivity * Input.GetAxis("Mouse Y") * Time.deltaTime;
        _pitch = Mathf.Clamp(_pitch, -maxLookAngle, maxLookAngle);

        transform.localEulerAngles = new Vector3(0, _yaw, 0);
        cam.transform.localEulerAngles = new Vector3(_pitch, 0, 0);

        if (Input.GetKeyDown(KeyCode.Space) && isGrounded)
            _jumpRequested = true;

        // Crouch toggle
        if (Input.GetKeyDown(KeyCode.LeftControl))
            _isCrouching = !_isCrouching;

        // Can't crouch while sprinting; uncrouch on jump
        if (Input.GetKey(KeyCode.LeftShift) || _jumpRequested)
            _isCrouching = false;

        UpdateCrouch();

        // Send position/rotation to server at fixed interval
        _sendTimer += Time.deltaTime;
        if (_sendTimer >= sendInterval)
        {
            _sendTimer = 0f;
            uint anim = 0; // idle
            if (!isGrounded) anim = 4; // airborne
            else if (_isCrouching) anim = 3;
            else if (_isWalking && Input.GetKey(KeyCode.LeftShift)) anim = 2; // sprint
            else if (_isWalking) anim = 1; // walk
            networkManager.SendPlayerUpdate(transform.position, cam.transform.eulerAngles, anim);
        }
    }

    void FixedUpdate()
    {
        CheckGround();

        // Build input direction
        Vector3 input = new Vector3(Input.GetAxis("Horizontal"), 0, Input.GetAxis("Vertical"));
        _isWalking = input.x != 0 || input.z != 0;

        float speed = _isCrouching ? crouchSpeed : (Input.GetKey(KeyCode.LeftShift) ? sprintSpeed : walkSpeed);
        Vector3 targetVelocity = transform.TransformDirection(input) * speed;

        // Scale control by ground friction — low friction (ice) means less ability to change velocity
        float grip = Mathf.Clamp01(_groundFriction);
        float effectiveMaxChange = maxVelocityChange * (isGrounded ? grip : 0.15f);

        Vector3 velocityChange = targetVelocity - rb.linearVelocity;
        velocityChange.x = Mathf.Clamp(velocityChange.x, -effectiveMaxChange, effectiveMaxChange);
        velocityChange.z = Mathf.Clamp(velocityChange.z, -effectiveMaxChange, effectiveMaxChange);
        velocityChange.y = 0;

        rb.AddForce(velocityChange, ForceMode.VelocityChange);

        if (_jumpRequested)
        {
            rb.AddForce(Vector3.up * jumpForce, ForceMode.VelocityChange);
            _jumpRequested = false;
        }
    }

    private void CheckGround()
    {
        // Spherecast downward from center of collider
        float radius = 0.25f;
        Vector3 origin = transform.position + Vector3.up * 0.1f;

        if (Physics.SphereCast(origin, radius, Vector3.down, out RaycastHit hit, groundCheckDistance, groundMask))
        {
            isGrounded = true;

            // Read friction from the ground's physics material
            Collider groundCol = hit.collider;
            if (groundCol.sharedMaterial != null)
                _groundFriction = groundCol.sharedMaterial.dynamicFriction;
            else
                _groundFriction = 1.0f; // default full grip when no material assigned
        }
        else
        {
            isGrounded = false;
            _groundFriction = 1.0f;
        }
    }

    private void UpdateCrouch()
    {
        float targetHeight = _isCrouching ? crouchHeight : _standingHeight;
        float targetCamY = _isCrouching ? _standingCamY - (_standingHeight - crouchHeight) : _standingCamY;

        float t = crouchTransitionSpeed * Time.deltaTime;

        _collider.height = Mathf.Lerp(_collider.height, targetHeight, t);
        _collider.center = new Vector3(
            _standingCenter.x,
            _standingCenter.y - (_standingHeight - _collider.height) / 2f,
            _standingCenter.z
        );

        Vector3 camPos = cam.transform.localPosition;
        camPos.y = Mathf.Lerp(camPos.y, targetCamY, t);
        cam.transform.localPosition = camPos;
    }
}